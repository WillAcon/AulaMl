<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/components/Icon.svelte';
	import { getTrack } from '$lib/data';
	import { progress } from '$lib/progress.svelte';

	const track = $derived(getTrack(page.params.track ?? ''));
	const ids = $derived(track?.flatLessons.map((lesson) => lesson.id) ?? []);
	const pct = $derived(progress.percent(ids));
	const nextLesson = $derived(
		track?.flatLessons.find((lesson) => !progress.isDone(lesson.id)) ?? track?.flatLessons[0]
	);
	const totalMinutes = $derived(
		track?.flatLessons.reduce((sum, lesson) => sum + lesson.minutes, 0) ?? 0
	);
	const exerciseCount = $derived(
		track?.flatLessons.reduce(
			(total, lesson) => total + lesson.blocks.filter((block) => block.type === 'exercise').length,
			0
		) ?? 0
	);
	const quizCount = $derived(
		track?.flatLessons.reduce(
			(total, lesson) => total + lesson.blocks.filter((block) => block.type === 'quiz').length,
			0
		) ?? 0
	);
</script>

<svelte:head>
	<title>{track?.name ?? 'Curso'} · AulaML</title>
</svelte:head>

{#if track}
	<div class="track-page {track.id}">
		<nav class="crumb" aria-label="Ruta">
			<a href="/"><Icon name="home" size={12} /> Inicio</a>
			<span>/</span>
			<span>{track.name}</span>
		</nav>

		<header class="hero">
			<div class="hero-main">
				<span class="label">Curso {track.id === 'python' ? '01' : '02'} · {track.modules.length} módulos</span>
				<h1>{track.name}</h1>
				<p class="tagline">{track.tagline}</p>
				<p class="desc">{track.description}</p>
				<div class="chips">
					<span class="chip"><Icon name="book" size={12} /> {track.flatLessons.length} {track.flatLessons.length === 1 ? 'lección' : 'lecciones'}</span>
					<span class="chip"><Icon name="clock" size={12} /> {Math.round(totalMinutes / 60)} horas</span>
					<span class="chip"><Icon name="pencil" size={12} /> {exerciseCount} ejercicios</span>
					<span class="chip"><Icon name="target" size={12} /> {quizCount} evaluaciones</span>
				</div>
				{#if nextLesson}
					<a class="cta btn primary" href="/{nextLesson.track}/{nextLesson.id}/">
						{progress.doneCount(ids) ? 'Continuar' : 'Empezar'} · {nextLesson.title}
						<Icon name="arrowRight" size={14} />
					</a>
				{/if}
			</div>

			<div class="ring-card">
				<div class="ring" style="--p:{pct}%">
					<div class="ring-in"><strong>{pct}%</strong><span>completado</span></div>
				</div>
				<div class="ring-stats">
					<div><span>Completadas</span><strong>{progress.doneCount(ids)} / {ids.length}</strong></div>
					<div><span>Módulos</span><strong>{track.modules.filter((m) => progress.percent(m.lessonsData.map((l) => l.id)) === 100).length} / {track.modules.length}</strong></div>
				</div>
			</div>
		</header>

		<div class="modules">
			{#each track.modules as mod, mi}
				{@const modIds = mod.lessonsData.map((lesson) => lesson.id)}
				{@const modPct = progress.percent(modIds)}
				<section class="module" id={mod.id}>
					<header>
						<div class="mnum">{String(mi + 1).padStart(2, '0')}</div>
						<div class="mtext">
							<h2>{mod.title}</h2>
							{#if mod.description}<p>{mod.description}</p>{/if}
						</div>
						<div class="mmeta">
							<span>{mod.lessonsData.length} {mod.lessonsData.length === 1 ? 'lección' : 'lecciones'}</span>
							<div class="mbar"><i style="width:{modPct}%"></i></div>
							<span class="mpct">{modPct}%</span>
						</div>
					</header>

					<ul class="lessons">
						{#each mod.lessonsData as lesson}
							{@const done = progress.isDone(lesson.id)}
							{@const index = track.flatLessons.findIndex((item) => item.id === lesson.id) + 1}
							<li>
								<a href="/{lesson.track}/{lesson.id}/" class:done>
									<span class="lnum">{String(index).padStart(2, '0')}</span>
									<span class="lmain">
										<span class="ltitle">{lesson.title}</span>
										{#if lesson.subtitle}<span class="lsub">{lesson.subtitle}</span>{/if}
									</span>
									<span class="lmeta">
										<span class="level {lesson.level}">{lesson.level}</span>
										<span class="lmin">{lesson.minutes} min</span>
										<span class="lstate" class:ok={done}>
											<Icon name={done ? 'check' : 'arrowRight'} size={13} />
										</span>
									</span>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	</div>
{:else}
	<div class="notfound">
		<h1>Curso no encontrado</h1>
		<p>Vuelve al inicio para ver los cursos disponibles.</p>
		<a class="btn primary" href="/">Ir al inicio</a>
	</div>
{/if}

<style>
	.track-page {
		max-width: 960px;
		margin: 0 auto;
		padding: 24px 30px 50px;
	}

	.crumb {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 11px;
		color: var(--faint);
		margin-bottom: 22px;
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

	.hero {
		display: flex;
		gap: 34px;
		align-items: flex-start;
		justify-content: space-between;
		padding-bottom: 30px;
		border-bottom: 1px solid var(--line);
	}

	.hero-main {
		max-width: 640px;
	}

	.label {
		font-size: 10px;
		font-weight: 750;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--faint);
	}

	.track-page.python .label {
		color: var(--py);
	}
	.track-page.cpp .label {
		color: var(--cpp);
	}

	h1 {
		margin: 6px 0 0;
		font-size: clamp(2.4rem, 5vw, 3.2rem);
		letter-spacing: -0.04em;
	}
	.python h1 {
		color: var(--text);
	}
	.tagline {
		margin: 2px 0 0;
		font-size: 15px;
		font-weight: 550;
		color: var(--muted);
	}
	.desc {
		margin: 12px 0 0;
		font-size: 14px;
		line-height: 1.7;
		color: var(--text-2);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 14px;
	}
	.chips .chip {
		gap: 4px;
	}

	.cta {
		margin-top: 18px;
		max-width: 100%;
	}

	.ring-card {
		flex: none;
		width: 210px;
		padding: 18px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--panel);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 13px;
	}

	.ring {
		width: 116px;
		height: 116px;
		border-radius: 50%;
		background: conic-gradient(var(--accent) var(--p), var(--line) 0);
		display: grid;
		place-items: center;
	}
	.python .ring {
		background: conic-gradient(var(--py) var(--p), var(--line) 0);
	}
	.cpp .ring {
		background: conic-gradient(var(--cpp) var(--p), var(--line) 0);
	}
	.ring-in {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		background: var(--panel);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.ring-in strong {
		font-size: 24px;
		letter-spacing: -0.03em;
	}
	.ring-in span {
		font-size: 9.5px;
		color: var(--faint);
	}

	.ring-stats {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 5px;
		font-size: 10.5px;
	}
	.ring-stats div {
		display: flex;
		justify-content: space-between;
		color: var(--faint);
	}
	.ring-stats strong {
		color: var(--text-2);
		font-family: var(--font-mono);
		font-size: 10.5px;
	}

	.modules {
		display: flex;
		flex-direction: column;
		gap: 26px;
		margin-top: 30px;
	}

	.module {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--panel);
		overflow: hidden;
		scroll-margin-top: calc(var(--topbar) + 20px);
	}

	.module > header {
		display: flex;
		align-items: flex-start;
		gap: 13px;
		padding: 15px 17px;
		background: var(--panel-2);
		border-bottom: 1px solid var(--line);
	}

	.mnum {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--faint);
		padding-top: 3px;
	}

	.mtext {
		flex: 1;
		min-width: 0;
	}
	.mtext h2 {
		margin: 0;
		font-size: 17px;
		letter-spacing: -0.02em;
	}
	.mtext p {
		margin: 3px 0 0;
		font-size: 12px;
		color: var(--faint);
		line-height: 1.5;
	}

	.mmeta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
		font-size: 10px;
		color: var(--faint);
		padding-top: 4px;
	}

	.mbar {
		width: 60px;
		height: 3px;
		border-radius: 2px;
		background: var(--line);
		overflow: hidden;
	}
	.mbar i {
		display: block;
		height: 100%;
		background: var(--accent);
	}
	.python .mbar i {
		background: var(--py);
	}
	.cpp .mbar i {
		background: var(--cpp);
	}
	.mpct {
		font-family: var(--font-mono);
		width: 30px;
		text-align: right;
	}

	.lessons {
		list-style: none;
		margin: 0;
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.lessons a {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 9px 11px;
		border-radius: 8px;
		color: var(--text);
	}
	.lessons a:hover {
		background: var(--panel-2);
		text-decoration: none;
	}

	.lnum {
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--faint);
		width: 20px;
		flex: none;
	}
	.lessons a.done .lnum {
		color: var(--ok);
	}

	.lmain {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
		min-width: 0;
	}
	.ltitle {
		font-size: 13.5px;
		font-weight: 550;
	}
	.lessons a.done .ltitle {
		color: var(--text-2);
	}
	.lsub {
		font-size: 11px;
		color: var(--faint);
	}

	.lmeta {
		display: flex;
		align-items: center;
		gap: 10px;
		flex: none;
	}

	.level {
		font-size: 9px;
		font-weight: 650;
		text-transform: capitalize;
		padding: 1px 6px;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--faint);
	}
	.level.avanzado {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 35%, var(--line));
	}
	.level.intermedio {
		color: var(--warn);
		border-color: color-mix(in srgb, var(--warn) 35%, var(--line));
	}

	.lmin {
		font-family: var(--font-mono);
		font-size: 9.5px;
		color: var(--faint);
		width: 44px;
		text-align: right;
	}

	.lstate {
		display: inline-flex;
		color: var(--faint);
		width: 18px;
		justify-content: flex-end;
	}
	.lstate.ok {
		color: var(--ok);
	}

	.notfound {
		padding: 90px 24px;
		text-align: center;
	}

	@media (max-width: 800px) {
		.track-page {
			padding: 18px 18px 40px;
		}
		.hero {
			flex-direction: column;
			gap: 20px;
		}
		.ring-card {
			width: 100%;
			flex-direction: row;
			justify-content: flex-start;
			gap: 20px;
		}
		.ring {
			width: 86px;
			height: 86px;
		}
		.ring-in {
			width: 70px;
			height: 70px;
		}
		.ring-in strong {
			font-size: 17px;
		}
		.ring-stats {
			flex: 1;
		}
		.module > header {
			flex-wrap: wrap;
		}
		.mmeta {
			width: 100%;
			padding-left: 25px;
		}
		.lmeta .level {
			display: none;
		}
		.lsub {
			display: none;
		}
	}
</style>
