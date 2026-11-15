<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { tracks, moduleIdByLesson } from '$lib/data';
	import { progress } from '$lib/progress.svelte';
	import { onMount, tick } from 'svelte';
	import Icon from './Icon.svelte';

	let { onNavigate, open = false }: { onNavigate?: () => void; open?: boolean } = $props();

	const pathname = $derived(page.url.pathname.replace(/\/$/, ''));
	const currentId = $derived(pathname.split('/').filter(Boolean).at(-1) ?? '');
	const currentTrack = $derived(pathname.split('/').filter(Boolean)[0] ?? '');

	let openModules = $state<string[]>([]);

	onMount(() => {
		const active = moduleIdByLesson.get(currentId);
		const seeds = tracks.map((track) => track.modules[0]?.id).filter(Boolean) as string[];
		openModules = [...new Set([...seeds, ...(active ? [active] : [])])];
	});

	afterNavigate(async () => {
		const active = moduleIdByLesson.get(currentId);
		if (active && !openModules.includes(active)) openModules = [...openModules, active];
		await tick();
		document
			.querySelector('.sidebar .lessons a.active')
			?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	});

	function toggle(id: string) {
		openModules = openModules.includes(id)
			? openModules.filter((item) => item !== id)
			: [...openModules, id];
	}

	const isOpen = (id: string) => openModules.includes(id);
</script>

<aside class="sidebar" class:open>
	<nav aria-label="Lecciones del curso">
		{#each tracks as track}
			{@const ids = track.flatLessons.map((lesson) => lesson.id)}
			{@const pct = progress.percent(ids)}
			<div class="track" class:active-track={currentTrack === track.id}>
				<a class="track-head" href="/{track.id}/" onclick={onNavigate}>
					<span class="dot {track.id}" aria-hidden="true"></span>
					<span class="tname">{track.name}</span>
					<span class="tcount">{progress.doneCount(ids)}/{ids.length}</span>
					<span class="tbar"><i style="width:{pct}%"></i></span>
				</a>

				<div class="modules">
					{#each track.modules as mod, mi}
						{@const modIds = mod.lessonsData.map((lesson) => lesson.id)}
						{@const modPct = progress.percent(modIds)}
						<div class="module" class:current={modIds.includes(currentId)}>
							<button class="module-head" onclick={() => toggle(mod.id)} aria-expanded={isOpen(mod.id)}>
								<span class="chev" class:open={isOpen(mod.id)}><Icon name="chevron" size={12} /></span>
								<span class="mnum">{String(mi + 1).padStart(2, '0')}</span>
								<span class="mtitle">{mod.title}</span>
								{#if modPct === 100}
									<span class="mdone"><Icon name="check" size={11} /></span>
								{:else}
									<span class="mpct">{modPct}%</span>
								{/if}
							</button>

							{#if isOpen(mod.id)}
								<ul class="lessons">
									{#each mod.lessonsData as lesson}
										{@const active = lesson.id === currentId}
										{@const done = progress.isDone(lesson.id)}
										{@const fav = progress.isFav(lesson.id)}
										<li>
											<a
												href="/{lesson.track}/{lesson.id}/"
												class:active
												class:done
												onclick={onNavigate}
												aria-current={active ? 'page' : undefined}
											>
												<span class="status">
													{#if done}
														<Icon name="check" size={11} />
													{:else}
														<span class="bullet"></span>
													{/if}
												</span>
												<span class="ltitle">{lesson.title}</span>
												{#if fav}<span class="fav"><Icon name="star" size={10} /></span>{/if}
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}

		<div class="quick">
			<a href="/practica/" onclick={onNavigate}><Icon name="pencil" size={14} /> Práctica y ejercicios</a>
			<a href="/buscar/" onclick={onNavigate}><Icon name="search" size={14} /> Buscador de conceptos</a>
			<a href="/#metodologia" onclick={onNavigate}><Icon name="book" size={14} /> Cómo estudiar</a>
		</div>

		<div class="foot">
			<div class="foot-line">
				<span>Progreso total</span>
				<strong>{progress.percent(tracks.flatMap((t) => t.flatLessons.map((l) => l.id)))}%</strong>
			</div>
			<div class="foot-bar">
				<i style="width:{progress.percent(tracks.flatMap((t) => t.flatLessons.map((l) => l.id)))}%"></i>
			</div>
			<p>Se guarda en tu navegador. Sin cuentas.</p>
			<details class="reset">
				<summary>Reiniciar progreso</summary>
				<button
					onclick={() => {
						if (confirm('¿Borrar lecciones completadas, notas, favoritos y respuestas?')) progress.reset();
					}}
				>
					Borrar datos locales
				</button>
			</details>
		</div>
	</nav>
</aside>

<style>
	.sidebar {
		position: fixed;
		top: var(--topbar);
		bottom: 0;
		left: 0;
		width: var(--sidebar);
		z-index: 40;
		background: var(--bg-2);
		border-right: 1px solid var(--line);
		overflow-y: auto;
		overscroll-behavior: contain;
		transition: transform 0.24s var(--ease);
	}

	nav {
		padding: 14px 12px 22px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-height: 100%;
	}

	.track {
		border-radius: 10px;
	}

	.track-head {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 6px 7px;
		border-radius: 7px;
		color: var(--text);
		text-decoration: none;
	}
	.track-head:hover {
		background: var(--panel-2);
		text-decoration: none;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex: none;
	}
	.dot.python {
		background: var(--py);
		box-shadow: 0 0 0 3px var(--py-soft);
	}
	.dot.cpp {
		background: var(--cpp);
		box-shadow: 0 0 0 3px var(--cpp-soft);
	}

	.tname {
		font-size: 11px;
		font-weight: 750;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}
	.active-track .tname {
		color: var(--text);
	}

	.tcount {
		margin-left: auto;
		font-size: 9.5px;
		font-family: var(--font-mono);
		color: var(--faint);
	}

	.tbar {
		width: 38px;
		height: 3px;
		border-radius: 2px;
		background: var(--line);
		overflow: hidden;
		flex: none;
	}
	.tbar i {
		display: block;
		height: 100%;
		border-radius: 2px;
		background: var(--accent);
		transition: width 0.3s var(--ease);
	}
	.track:first-child .tbar i {
		background: var(--py);
	}
	.track:nth-child(2) .tbar i {
		background: var(--cpp);
	}

	.modules {
		display: flex;
		flex-direction: column;
		gap: 1px;
		margin-top: 3px;
	}

	.module {
		border-radius: 8px;
	}

	.module-head {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 5px 7px;
		border: 0;
		border-radius: 7px;
		background: transparent;
		color: var(--muted);
		font-size: 12.2px;
		text-align: left;
		cursor: pointer;
		line-height: 1.4;
	}
	.module-head:hover {
		background: var(--panel-2);
		color: var(--text-2);
	}
	.module.current > .module-head {
		color: var(--text);
	}

	.chev {
		display: inline-flex;
		transition: transform 0.18s;
		color: var(--faint);
		flex: none;
	}
	.chev.open {
		transform: rotate(90deg);
	}

	.mnum {
		font-family: var(--font-mono);
		font-size: 9.5px;
		color: var(--faint);
		flex: none;
		width: 15px;
	}

	.mtitle {
		flex: 1;
		min-width: 0;
	}

	.mpct {
		font-size: 9px;
		font-family: var(--font-mono);
		color: var(--faint);
		flex: none;
	}

	.mdone {
		display: inline-flex;
		color: var(--ok);
		flex: none;
	}

	.lessons {
		list-style: none;
		margin: 1px 0 5px;
		padding: 0 0 0 13px;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	.lessons::before {
		content: '';
		position: absolute;
		left: 13px;
		top: 4px;
		bottom: 5px;
		width: 1px;
		background: var(--line);
	}

	.lessons li {
		margin: 0;
	}

	.lessons a {
		display: flex;
		align-items: flex-start;
		gap: 7px;
		padding: 5px 7px 5px 11px;
		border-radius: 0 6px 6px 0;
		color: var(--muted);
		font-size: 12.4px;
		line-height: 1.42;
		text-decoration: none;
		position: relative;
		border-left: 2px solid transparent;
		transition:
			background 0.12s,
			color 0.12s;
	}
	.lessons a:hover {
		background: var(--panel-2);
		color: var(--text);
		text-decoration: none;
	}
	.lessons a.active {
		background: var(--accent-soft);
		border-left-color: var(--accent);
		color: var(--text);
		font-weight: 550;
	}

	.status {
		width: 13px;
		height: 13px;
		display: grid;
		place-items: center;
		flex: none;
		margin-top: 2px;
		color: var(--ok);
	}

	.bullet {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--line);
	}
	.lessons a.done .bullet,
	.lessons a.done .ltitle {
		opacity: 0.72;
	}

	.ltitle {
		flex: 1;
		min-width: 0;
	}

	.fav {
		display: inline-flex;
		color: var(--py);
		flex: none;
		margin-top: 3px;
	}

	.quick {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding-top: 10px;
		border-top: 1px solid var(--line-soft);
	}

	.quick a {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		border-radius: 7px;
		color: var(--muted);
		font-size: 12px;
		text-decoration: none;
	}
	.quick a:hover {
		background: var(--panel-2);
		color: var(--text);
		text-decoration: none;
	}

	.foot {
		margin-top: auto;
		padding: 12px 8px 0;
		border-top: 1px solid var(--line-soft);
	}

	.foot-line {
		display: flex;
		justify-content: space-between;
		font-size: 10.5px;
		color: var(--faint);
	}
	.foot-line strong {
		color: var(--text-2);
		font-family: var(--font-mono);
		font-size: 10.5px;
	}

	.foot-bar {
		height: 4px;
		margin-top: 5px;
		border-radius: 3px;
		background: var(--line);
		overflow: hidden;
	}
	.foot-bar i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--py), var(--accent), var(--cpp));
		border-radius: 3px;
		transition: width 0.4s var(--ease);
	}

	.foot p {
		margin: 6px 0 0;
		font-size: 10px;
		color: var(--faint);
		line-height: 1.4;
	}

	.reset {
		margin-top: 5px;
	}
	.reset summary {
		font-size: 10px;
		color: var(--faint);
		cursor: pointer;
		list-style: none;
	}
	.reset summary::-webkit-details-marker {
		display: none;
	}
	.reset summary:hover {
		color: var(--muted);
	}
	.reset button {
		margin-top: 5px;
		padding: 3px 7px;
		border-radius: 5px;
		border: 1px solid color-mix(in srgb, var(--danger) 30%, var(--line));
		background: var(--danger-soft);
		color: var(--danger);
		font-size: 10px;
		cursor: pointer;
	}

	@media (max-width: 1080px) {
		.sidebar {
			transform: translateX(-100%);
			box-shadow: var(--shadow);
			background: var(--bg-2);
		}
		.sidebar.open {
			transform: translateX(0);
		}
	}
</style>
