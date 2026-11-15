<script lang="ts">
	import { page } from '$app/state';
	import { onMount, untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import LessonContent from '$lib/components/LessonContent.svelte';
	import { getLesson, getNeighbors, getModuleLessons, moduleTitleByLesson, trackById } from '$lib/data';
	import { buildToc } from '$lib/md';
	import { progress } from '$lib/progress.svelte';

	const lesson = $derived(getLesson(page.params.track ?? '', page.params.slug ?? ''));
	const neighbors = $derived(lesson ? getNeighbors(lesson) : {});
	const moduleLessons = $derived(lesson ? getModuleLessons(lesson) : []);
	const moduleTitle = $derived(lesson ? (moduleTitleByLesson.get(lesson.id) ?? '') : '');
	const toc = $derived(lesson ? buildToc(lesson.blocks) : []);
	const track = $derived(lesson ? trackById.get(lesson.track) : undefined);

	let mounted = $state(false);
	let activeHeading = $state('');
	let scrollPct = $state(0);
	let note = $state('');
	let loadedId = $state('');
	let saved = $state(false);
	let noteTimer: ReturnType<typeof setTimeout> | undefined;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	const done = $derived(mounted && lesson ? progress.isDone(lesson.id) : false);
	const fav = $derived(mounted && lesson ? progress.isFav(lesson.id) : false);

	onMount(() => {
		mounted = true;
	});

	// Al cambiar de lección sin desmontar la página (navegación entre parámetros),
	// carga la nota correcta una sola vez.
	$effect(() => {
		const id = lesson?.id;
		if (!id || !mounted || loadedId === id) return;
		loadedId = id;
		untrack(() => {
			note = progress.note(id);
		});
		progress.visit(id);
		activeHeading = '';
	});

	$effect(() => {
		if (!lesson) return;
		const id = lesson.id;
		if (!mounted) return;
		clearTimeout(noteTimer);
		noteTimer = setTimeout(() => {
			progress.setNote(id, note);
			saved = true;
			clearTimeout(saveTimer);
			saveTimer = setTimeout(() => (saved = false), 1400);
		}, 650);
		return () => clearTimeout(noteTimer);
	});

	$effect(() => {
		if (!lesson) return;
		const headings = Array.from(document.querySelectorAll<HTMLElement>('.prose h3[id]'));
		if (!headings.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeHeading = entry.target.id;
					}
				}
			},
			{ rootMargin: '-80px 0px -68% 0px', threshold: 0 }
		);
		headings.forEach((heading) => observer.observe(heading));
		return () => observer.disconnect();
	});

	function onscroll() {
		const doc = document.documentElement;
		const max = doc.scrollHeight - doc.clientHeight;
		scrollPct = max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0;
	}

	function toggleDone() {
		if (!lesson) return;
		progress.toggleDone(lesson.id);
	}
</script>

<svelte:window onscroll={onscroll} />

<svelte:head>
	<title>{lesson ? `${lesson.title} · ${track?.name ?? ''} · AulaML` : 'Lección no encontrada · AulaML'}</title>
</svelte:head>

{#if lesson}
	<div class="readbar" style="width:{scrollPct}%"></div>

	<article class="lesson {lesson.track}">
		<div class="main-col">
			<nav class="crumb" aria-label="Ruta">
				<a href="/"><Icon name="home" size={12} /> Inicio</a>
				<span>/</span>
				<a href="/{lesson.track}/">{track?.name}</a>
				<span>/</span>
				<span class="module">{moduleTitle}</span>
			</nav>

			<header class="head">
				<div class="meta-top">
					<span class="chip {lesson.track}">{track?.name}</span>
					<span class="level {lesson.level}">{lesson.level}</span>
					<span class="dot">·</span>
					<span class="mins"><Icon name="clock" size={12} /> {lesson.minutes} min</span>
					<span class="dot">·</span>
					<span class="mod-name">{moduleTitle}</span>
				</div>

				<h1>{lesson.title}</h1>
				{#if lesson.subtitle}<p class="subtitle">{lesson.subtitle}</p>{/if}
				{#if lesson.summary}<p class="summary">{lesson.summary}</p>{/if}

				<div class="actions">
					<button class="btn sm" class:done onclick={toggleDone}>
						<Icon name={done ? 'check' : 'target'} size={13} />
						{done ? 'Lección completada' : 'Marcar como completada'}
					</button>
					<button
						class="btn sm ghost"
						class:fav
						onclick={() => lesson && progress.toggleFav(lesson.id)}
						aria-pressed={fav}
					>
						<Icon name="star" size={13} />
						{fav ? 'En favoritos' : 'Guardar para repasar'}
					</button>
					<span class="pos">
						Lección {moduleLessons.findIndex((item) => item.id === lesson.id) + 1} de
						{moduleLessons.length} del módulo
					</span>
				</div>
			</header>

			{#if lesson.objectives?.length}
				<div class="objectives">
					<div class="obj-title"><Icon name="target" size={14} /> Al terminar esta lección podrás</div>
					<ul>
						{#each lesson.objectives as objective}
							<li><Icon name="check" size={12} /> {objective}</li>
						{/each}
					</ul>
					{#if lesson.prerequisites?.length}
						<p class="prereq">
							<strong>Antes necesitas:</strong>
							{lesson.prerequisites.join(' · ')}
						</p>
					{/if}
				</div>
			{/if}

			<details class="mobile-toc">
				<summary><Icon name="list" size={14} /> En esta lección</summary>
				<ol>
					{#each toc as item}
						<li><a href="#{item.id}">{item.text}</a></li>
					{/each}
				</ol>
			</details>

			{#key lesson.id}
				<LessonContent blocks={lesson.blocks} lessonId={lesson.id} />
			{/key}

			<section class="notes">
				<div class="notes-head">
					<span><Icon name="pencil" size={14} /> Tus notas</span>
					{#if saved}<span class="saved"><Icon name="check" size={11} /> Guardado</span>{/if}
				</div>
				<textarea
					bind:value={note}
					placeholder="Escribe aquí dudas, ideas o atajos que quieras recordar. Se guardan solo en este navegador."
					rows="4"
				></textarea>
			</section>

			<section class="complete">
				<div>
					<h3>{done ? 'Lección completada' : '¿Ya lo entendiste?'}</h3>
					<p>
						{done
							? 'Puedes seguir con la siguiente lección o repasar los ejercicios.'
							: 'Márcala como completada para llevar tu progreso y desbloquear el siguiente paso de la ruta.'}
					</p>
				</div>
				<button class="btn" class:primary={!done} onclick={toggleDone}>
					<Icon name={done ? 'reset' : 'check'} size={14} />
					{done ? 'Desmarcar' : 'Completar lección'}
				</button>
			</section>

			<nav class="pager" aria-label="Lecciones anterior y siguiente">
				{#if neighbors.prev}
					<a class="pg prev" href="/{neighbors.prev.track}/{neighbors.prev.id}/">
						<span class="dir"><Icon name="arrowLeft" size={13} /> Anterior</span>
						<span class="ptitle">{neighbors.prev.title}</span>
					</a>
				{:else}
					<span></span>
				{/if}
				{#if neighbors.next}
					<a class="pg next" href="/{neighbors.next.track}/{neighbors.next.id}/">
						<span class="dir">Siguiente <Icon name="arrowRight" size={13} /></span>
						<span class="ptitle">{neighbors.next.title}</span>
					</a>
				{/if}
			</nav>

			{#if moduleLessons.length > 1}
				<section class="related">
					<h4>Más en «{moduleTitle}»</h4>
					<div class="rel-list">
						{#each moduleLessons as item}
							{#if item.id !== lesson.id}
								<a href="/{item.track}/{item.id}/" class:is-done={mounted && progress.isDone(item.id)}>
									<Icon name={mounted && progress.isDone(item.id) ? 'check' : 'chevron'} size={11} />
									{item.title}
								</a>
							{/if}
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<aside class="toc">
			<div class="toc-in">
				<p class="toc-title">En esta lección</p>
				<ol>
					{#each toc as item}
						<li>
							<a href="#{item.id}" class:active={activeHeading === item.id}>{item.text}</a>
						</li>
					{/each}
				</ol>
				<div class="toc-foot">
					<div class="tbar"><i style="width:{scrollPct}%"></i></div>
					<span>{Math.round(scrollPct)}% leído</span>
				</div>
			</div>
		</aside>
	</article>
{:else}
	<div class="notfound">
		<p class="code">404</p>
		<h1>No encontré esa lección</h1>
		<p>Puede que el enlace esté mal escrito. Vuelve al inicio o usa el buscador.</p>
		<div class="nf-actions">
			<a class="btn primary" href="/">Ir al inicio</a>
			<a class="btn" href="/buscar/">Buscar un concepto</a>
		</div>
	</div>
{/if}

<style>
	.readbar {
		position: fixed;
		top: var(--topbar);
		left: var(--sidebar);
		height: 2px;
		background: linear-gradient(90deg, var(--py), var(--accent), var(--cpp));
		z-index: 45;
		transition: width 0.08s linear;
	}

	.lesson {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 218px;
		gap: 44px;
		max-width: 1140px;
		margin: 0 auto;
		padding: 22px 30px 70px;
	}

	.main-col {
		min-width: 0;
		max-width: 800px;
	}

	.crumb {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		font-size: 11px;
		color: var(--faint);
		margin-bottom: 18px;
	}
	.crumb a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: var(--muted);
	}
	.crumb a:hover {
		color: var(--text);
	}
	.crumb .module {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 260px;
	}

	.head {
		padding-bottom: 18px;
		border-bottom: 1px solid var(--line);
	}

	.meta-top {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 7px;
		font-size: 11px;
		color: var(--faint);
	}

	.meta-top .chip {
		font-size: 10px;
		padding: 2px 8px;
	}
	.level {
		font-size: 9.5px;
		font-weight: 650;
		text-transform: capitalize;
		padding: 2px 7px;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--muted);
	}
	.level.avanzado {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 35%, var(--line));
	}
	.level.intermedio {
		color: var(--warn);
		border-color: color-mix(in srgb, var(--warn) 35%, var(--line));
	}
	.dot {
		opacity: 0.5;
	}
	.mins {
		display: inline-flex;
		align-items: center;
		gap: 3px;
	}
	.mod-name {
		color: var(--muted);
	}

	h1 {
		margin: 12px 0 0;
		font-size: clamp(1.9rem, 4.2vw, 2.7rem);
		line-height: 1.12;
		letter-spacing: -0.035em;
	}

	.subtitle {
		margin: 8px 0 0;
		font-size: 16px;
		line-height: 1.55;
		color: var(--muted);
	}

	.summary {
		margin: 10px 0 0;
		font-size: 14px;
		line-height: 1.7;
		color: var(--text-2);
		padding: 10px 12px;
		border-left: 2px solid var(--line);
	}

	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 7px;
		margin-top: 15px;
	}

	.btn.done {
		color: var(--ok);
		border-color: color-mix(in srgb, var(--ok) 35%, var(--line));
		background: var(--ok-soft);
	}
	.btn.fav {
		color: var(--py);
	}

	.pos {
		margin-left: auto;
		font-size: 10.5px;
		color: var(--faint);
	}

	.objectives {
		margin-top: 20px;
		padding: 13px 15px;
		border: 1px solid var(--line);
		border-radius: 11px;
		background: var(--panel);
	}

	.obj-title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 10.5px;
		font-weight: 750;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.objectives ul {
		list-style: none;
		margin: 8px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.objectives li {
		display: flex;
		align-items: flex-start;
		gap: 7px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-2);
		margin: 0;
	}
	.objectives li :global(svg) {
		color: var(--ok);
		margin-top: 4px;
		flex: none;
	}

	.prereq {
		margin: 9px 0 0;
		padding-top: 8px;
		border-top: 1px dashed var(--line-soft);
		font-size: 11.5px;
		color: var(--faint);
	}
	.prereq strong {
		color: var(--muted);
		font-weight: 600;
	}

	.mobile-toc {
		display: none;
		margin-top: 16px;
		border: 1px solid var(--line);
		border-radius: 9px;
		background: var(--panel);
		padding: 8px 12px;
	}
	.mobile-toc summary {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 600;
		color: var(--muted);
		cursor: pointer;
	}
	.mobile-toc ol {
		margin: 7px 0 3px;
		padding-left: 18px;
		font-size: 12px;
		line-height: 1.7;
	}

	.notes {
		margin-top: 30px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--panel);
		overflow: hidden;
	}

	.notes-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 9px 13px;
		border-bottom: 1px solid var(--line-soft);
		background: var(--panel-2);
		font-size: 11px;
		font-weight: 650;
		color: var(--muted);
	}
	.notes-head span:first-child {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.saved {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		color: var(--ok);
		font-size: 10px;
	}

	.notes textarea {
		display: block;
		width: 100%;
		border: 0;
		resize: vertical;
		background: transparent;
		padding: 11px 13px;
		font-size: 13px;
		line-height: 1.65;
		color: var(--text);
		outline: none;
		min-height: 90px;
	}
	.notes textarea::placeholder {
		color: var(--faint);
	}

	.complete {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		margin-top: 18px;
		padding: 16px 18px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background:
			radial-gradient(400px 120px at 0% 0%, var(--glow-b), transparent 70%),
			var(--panel);
	}
	.complete h3 {
		margin: 0;
		font-size: 15px;
	}
	.complete p {
		margin: 3px 0 0;
		font-size: 12px;
		line-height: 1.55;
		color: var(--muted);
		max-width: 440px;
	}

	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-top: 24px;
	}

	.pg {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 12px 14px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--panel);
		color: var(--text);
		min-width: 0;
	}
	.pg:hover {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
		text-decoration: none;
	}
	.pg.next {
		text-align: right;
		align-items: flex-end;
	}
	.dir {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 9.5px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
		color: var(--faint);
	}
	.ptitle {
		font-size: 12.5px;
		font-weight: 550;
		line-height: 1.4;
	}

	.related {
		margin-top: 24px;
	}
	.related h4 {
		margin: 0 0 7px;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--faint);
	}
	.rel-list {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.rel-list a {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 6px;
		background: var(--panel);
		border: 1px solid var(--line);
		font-size: 11px;
		color: var(--muted);
	}
	.rel-list a:hover {
		color: var(--text);
		border-color: var(--accent);
		text-decoration: none;
	}
	.rel-list a.is-done {
		color: var(--ok);
	}

	.toc {
		position: relative;
	}

	.toc-in {
		position: sticky;
		top: calc(var(--topbar) + 22px);
		max-height: calc(100vh - var(--topbar) - 44px);
		overflow-y: auto;
		padding: 4px 0 0 14px;
		border-left: 1px solid var(--line);
	}

	.toc-title {
		margin: 0 0 8px;
		font-size: 9.5px;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		font-weight: 750;
		color: var(--faint);
	}

	.toc ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.toc a {
		display: block;
		padding: 3px 8px;
		border-radius: 5px;
		font-size: 11.5px;
		line-height: 1.45;
		color: var(--faint);
		border-left: 2px solid transparent;
		margin-left: -16px;
		padding-left: 14px;
	}
	.toc a:hover {
		color: var(--text-2);
		text-decoration: none;
	}
	.toc a.active {
		color: var(--accent);
		border-left-color: var(--accent);
		background: var(--accent-soft);
	}

	.toc-foot {
		margin-top: 13px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 9.5px;
		color: var(--faint);
	}
	.tbar {
		height: 3px;
		border-radius: 2px;
		background: var(--line);
		overflow: hidden;
	}
	.tbar i {
		display: block;
		height: 100%;
		background: var(--accent);
	}

	.notfound {
		max-width: 560px;
		margin: 0 auto;
		padding: 90px 24px;
		text-align: center;
	}
	.notfound .code {
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.2em;
		color: var(--accent);
		margin: 0;
	}
	.nf-actions {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-top: 18px;
		flex-wrap: wrap;
	}

	@media (max-width: 1180px) {
		.lesson {
			grid-template-columns: minmax(0, 1fr);
			max-width: 860px;
			gap: 0;
		}
		.toc {
			display: none;
		}
		.mobile-toc {
			display: block;
		}
	}

	@media (max-width: 1080px) {
		.readbar {
			left: 0;
		}
	}

	@media (max-width: 640px) {
		.lesson {
			padding: 16px 16px 50px;
		}
		.pos {
			margin-left: 0;
			width: 100%;
		}
		.pager {
			grid-template-columns: 1fr;
		}
		.pg.next {
			text-align: left;
			align-items: flex-start;
		}
		.complete {
			align-items: flex-start;
		}
		.actions .btn {
			font-size: 11px;
		}
	}
</style>
