<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { allLessons, moduleTitleByLesson, tracks } from '$lib/data';
	import { progress } from '$lib/progress.svelte';
	import { onMount } from 'svelte';
	import type { TrackId } from '$lib/types';

	type Kind = 'quiz' | 'exercise' | 'fill';

	interface Item {
		kind: Kind;
		lessonId: string;
		track: TrackId;
		title: string;
		preview: string;
		module: string;
		blockIndex: number;
	}

	const items: Item[] = allLessons.flatMap((lesson) =>
		lesson.blocks.flatMap((block, index): Item[] => {
			const base = {
				lessonId: lesson.id,
				track: lesson.track,
				module: moduleTitleByLesson.get(lesson.id) ?? '',
				blockIndex: index
			};
			if (block.type === 'quiz') {
				return [
					{
						...base,
						kind: 'quiz',
						title: `Evaluación · ${lesson.title}`,
						preview: block.question
					}
				];
			}
			if (block.type === 'exercise') {
				return [{ ...base, kind: 'exercise', title: block.title, preview: block.md }];
			}
			if (block.type === 'fill') {
				return [{ ...base, kind: 'fill', title: block.title ?? 'Completar código', preview: block.code }];
			}
			return [];
		})
	);

	let mounted = $state(false);
	onMount(() => (mounted = true));

	let trackFilter = $state<TrackId | 'all'>('all');
	let kindFilter = $state<Kind | 'all'>('all');
	let statusFilter = $state<'all' | 'pending' | 'done'>('all');

	function isDone(item: Item): boolean {
		if (!mounted) return false;
		if (item.kind === 'quiz') {
			return progress.quizAnswer(`${item.lessonId}:q:${item.blockIndex}`) !== undefined;
		}
		if (item.kind === 'exercise') {
			return progress.quizAnswer(`${item.lessonId}:x:${item.blockIndex}`) === 1;
		}
		return false;
	}

	const filtered = $derived(
		items.filter((item) => {
			if (trackFilter !== 'all' && item.track !== trackFilter) return false;
			if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
			if (statusFilter === 'done' && !isDone(item)) return false;
			if (statusFilter === 'pending' && isDone(item)) return false;
			return true;
		})
	);

	const counts = $derived({
		quiz: items.filter((item) => item.kind === 'quiz').length,
		exercise: items.filter((item) => item.kind === 'exercise').length,
		fill: items.filter((item) => item.kind === 'fill').length
	});

	const cleaned = (text: string) =>
		text
			.replace(/[#*_`]/g, '')
			.replace(/\s+/g, ' ')
			.trim();

	const kindLabel: Record<Kind, string> = {
		quiz: 'Evaluación',
		exercise: 'Ejercicio',
		fill: 'Completar'
	};
</script>

<svelte:head>
	<title>Práctica y ejercicios · AulaML</title>
</svelte:head>

<div class="practice">
	<header>
		<span class="kicker">Ponte a prueba</span>
		<h1>Practica lo que aprendiste.</h1>
		<p>
			Todos los ejercicios y evaluaciones de ambos cursos en un solo lugar. Cada tarjeta te lleva
			a la lección donde puedes responder, comprobar la solución y guardar tu avance.
		</p>
		<div class="pstats">
			<div><strong>{items.length}</strong><span>actividades</span></div>
			<div><strong>{counts.quiz}</strong><span>evaluaciones</span></div>
			<div><strong>{counts.exercise}</strong><span>ejercicios</span></div>
			<div><strong>{counts.fill}</strong><span>completar código</span></div>
		</div>
	</header>

	<div class="filters">
		<div class="group">
			<button class:on={trackFilter === 'all'} onclick={() => (trackFilter = 'all')}>Ambos cursos</button>
			{#each tracks as track}
				<button class:on={trackFilter === track.id} onclick={() => (trackFilter = track.id)}>
					{track.name}
				</button>
			{/each}
		</div>

		<div class="group">
			<button class:on={kindFilter === 'all'} onclick={() => (kindFilter = 'all')}>Todo</button>
			<button class:on={kindFilter === 'quiz'} onclick={() => (kindFilter = 'quiz')}>Evaluaciones</button>
			<button class:on={kindFilter === 'exercise'} onclick={() => (kindFilter = 'exercise')}>Ejercicios</button>
			{#if counts.fill}<button class:on={kindFilter === 'fill'} onclick={() => (kindFilter = 'fill')}>Completar</button>{/if}
		</div>

		<div class="group right">
			<button class:on={statusFilter === 'all'} onclick={() => (statusFilter = 'all')}>Todos</button>
			<button class:on={statusFilter === 'pending'} onclick={() => (statusFilter = 'pending')}>Pendientes</button>
			<button class:on={statusFilter === 'done'} onclick={() => (statusFilter = 'done')}>Resueltos</button>
		</div>
	</div>

	<div class="count">
		{filtered.length} {filtered.length === 1 ? 'actividad' : 'actividades'}
		{#if kindFilter !== 'all'}· {kindLabel[kindFilter as Kind].toLowerCase()}{/if}
	</div>

	{#if filtered.length}
		<div class="grid">
			{#each filtered as item}
				<a class="card {item.track}" href="/{item.track}/{item.lessonId}/" class:done={isDone(item)}>
					<div class="card-top">
						<span class="kind {item.kind}">
							<Icon name={item.kind === 'quiz' ? 'target' : 'pencil'} size={11} />
							{kindLabel[item.kind]}
						</span>
						<span class="lang">{item.track === 'python' ? 'Python' : 'C++'}</span>
						{#if isDone(item)}<span class="ok"><Icon name="check" size={11} /> resuelto</span>{/if}
					</div>
					<h3>{item.title}</h3>
					<p>{cleaned(item.preview).slice(0, 170)}{cleaned(item.preview).length > 170 ? '…' : ''}</p>
					<div class="card-foot">
						<span class="mod">{item.module}</span>
						<span class="open">Abrir <Icon name="arrowRight" size={12} /></span>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="empty">
			<Icon name="target" size={24} />
			<h2>No hay actividades con esos filtros.</h2>
			<p>Prueba a cambiar el curso, el tipo o el estado.</p>
		</div>
	{/if}
</div>

<style>
	.practice {
		max-width: 1040px;
		margin: 0 auto;
		padding: 30px 30px 70px;
	}

	.kicker {
		font-size: 10px;
		font-weight: 750;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent);
	}

	h1 {
		margin: 6px 0 8px;
		font-size: clamp(1.8rem, 4vw, 2.5rem);
		letter-spacing: -0.035em;
	}

	header > p {
		margin: 0;
		max-width: 660px;
		font-size: 14px;
		line-height: 1.65;
		color: var(--muted);
	}

	.pstats {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		margin-top: 18px;
		padding-top: 14px;
		border-top: 1px solid var(--line);
	}
	.pstats div {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}
	.pstats strong {
		font-size: 18px;
	}
	.pstats span {
		font-size: 11px;
		color: var(--faint);
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 22px;
		padding-bottom: 14px;
		border-bottom: 1px solid var(--line-soft);
	}

	.group {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.group.right {
		margin-left: auto;
	}

	.group button {
		padding: 4px 10px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: transparent;
		color: var(--muted);
		font-size: 11.5px;
		cursor: pointer;
	}
	.group button:hover {
		background: var(--panel-2);
		color: var(--text);
	}
	.group button.on {
		background: var(--accent-soft);
		border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
		color: var(--accent);
	}

	.count {
		font-size: 11px;
		color: var(--faint);
		margin: 12px 0 10px;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding: 14px 15px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--panel);
		color: var(--text);
		position: relative;
		transition:
			border-color 0.15s,
			transform 0.12s;
	}
	.card:hover {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
		text-decoration: none;
		transform: translateY(-1px);
	}
	.card.done {
		border-color: color-mix(in srgb, var(--ok) 25%, var(--line));
	}
	.card::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 2px;
		border-radius: 12px 0 0 12px;
		background: var(--py);
		opacity: 0.55;
	}
	.card.cpp::before {
		background: var(--cpp);
	}

	.card-top {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 9px;
	}
	.kind {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.kind.quiz {
		color: var(--accent);
	}
	.kind.exercise,
	.kind.fill {
		color: var(--py);
	}
	.lang {
		color: var(--faint);
	}
	.ok {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		margin-left: auto;
		color: var(--ok);
		font-size: 9.5px;
		font-weight: 600;
	}

	.card h3 {
		margin: 0;
		font-size: 13.5px;
		font-weight: 600;
		line-height: 1.4;
	}

	.card p {
		margin: 0;
		font-size: 11.5px;
		line-height: 1.55;
		color: var(--muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-top: auto;
		padding-top: 8px;
		font-size: 9.5px;
		color: var(--faint);
	}
	.mod {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.open {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		color: var(--accent);
		font-weight: 600;
		flex: none;
	}

	.empty {
		padding: 50px 20px;
		text-align: center;
		border: 1px dashed var(--line);
		border-radius: 14px;
		color: var(--faint);
	}
	.empty h2 {
		margin: 8px 0 4px;
		font-size: 17px;
		color: var(--text);
	}
	.empty p {
		margin: 0;
		font-size: 12.5px;
	}

	@media (max-width: 760px) {
		.practice {
			padding: 20px 18px 50px;
		}
		.grid {
			grid-template-columns: 1fr;
		}
		.group.right {
			margin-left: 0;
		}
	}
</style>
