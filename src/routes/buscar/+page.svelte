<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import SearchResultList from '$lib/components/SearchResultList.svelte';
	import { search, suggestedQueries } from '$lib/search';
	import { allLessons, tracks } from '$lib/data';
	import { trackEvent } from '$lib/analytics';
	import type { TrackId } from '$lib/types';

	let q = $state('');
	let filter = $state<TrackId | 'all'>('all');
	let input = $state<HTMLInputElement | null>(null);

	onMount(() => {
		q = new URL(location.href).searchParams.get('q') ?? '';
	});

	const hits = $derived(search(q, { track: filter, limit: 40 }));
	const tokensCount = $derived(q.trim().split(/\s+/).filter(Boolean).length);

	const pythonCount = $derived(search(q, { track: 'python', limit: 100 }).length);
	const cppCount = $derived(search(q, { track: 'cpp', limit: 100 }).length);

	afterNavigate(() => {
		const next = new URL(location.href).searchParams.get('q') ?? '';
		if (next !== q) q = next;
	});

	function logResult(hit: { doc: { id: string; track: string } }, index: number) {
		trackEvent('search_result_click', {
			search_term: q.trim(),
			lesson_id: hit.doc.id,
			track: hit.doc.track,
			position: index + 1,
			source: 'page'
		});
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (q.trim()) {
			trackEvent('search', {
				search_term: q.trim(),
				results: hits.length,
				track_filter: filter,
				source: 'page'
			});
		}
		const url = new URL(location.href);
		if (q.trim()) url.searchParams.set('q', q.trim());
		else url.searchParams.delete('q');
		history.replaceState({}, '', url);
	}

	function useTerm(term: string) {
		trackEvent('search_suggestion_click', { search_term: term, source: 'page' });
		q = term;
		input?.focus();
		const url = new URL(location.href);
		url.searchParams.set('q', term);
		history.replaceState({}, '', url);
	}
</script>

<svelte:head>
	<title>Buscar · AulaML</title>
</svelte:head>

<div class="search-page">
	<header>
		<span class="kicker">Buscador de conocimientos</span>
		<h1>Encuentra el concepto exacto.</h1>
		<p>
			Busca en las {allLessons.length} lecciones de Python y C++: títulos, palabras clave y todo el
			contenido. También entiende sinónimos: «puntero», «pointer» o «dirección de memoria».
		</p>

		<form class="box" onsubmit={submit} role="search">
			<Icon name="search" size={19} />
			<input
				bind:this={input}
				bind:value={q}
				placeholder="Ej.: diferencia entre lista y tupla, cómo funciona if, paso por referencia…"
				aria-label="Buscar concepto"
				autocomplete="off"
			/>
			{#if q}<button type="button" class="clear" onclick={() => (q = '')} aria-label="Limpiar">
					<Icon name="close" size={14} />
				</button>{/if}
			<button class="btn primary" type="submit">Buscar</button>
		</form>

		<div class="filters">
			<button class:on={filter === 'all'} onclick={() => (filter = 'all')}>Todo</button>
			<button class:on={filter === 'python'} onclick={() => (filter = 'python')}>
				Python {#if q}<span>{pythonCount}</span>{/if}
			</button>
			<button class:on={filter === 'cpp'} onclick={() => (filter = 'cpp')}>
				C++ {#if q}<span>{cppCount}</span>{/if}
			</button>
			<span class="local"><Icon name="check" size={11} /> Búsqueda local, sin internet</span>
		</div>
	</header>

	{#if !q.trim()}
		<section class="start">
			<div class="sug">
				<p class="label">Consultas típicas</p>
				<div class="chips">
					{#each suggestedQueries as term}
						<button onclick={() => useTerm(term)}>{term}</button>
					{/each}
				</div>
			</div>

			<div class="browse">
				<p class="label">O explora un curso</p>
				<div class="courses">
					{#each tracks as track}
						<a href="/{track.id}/" class="course {track.id}">
							<span class="cn">{track.name}</span>
							<span class="cd">{track.tagline}</span>
							<span class="cc">{track.flatLessons.length} lecciones · {track.modules.length} módulos</span>
							<Icon name="arrowRight" size={15} />
						</a>
					{/each}
				</div>
			</div>
		</section>
	{:else if hits.length === 0}
		<div class="empty">
			<Icon name="search" size={26} />
			<h2>Sin resultados para «{q}»</h2>
			<p>
				Prueba con menos palabras o con un término más general. Ejemplos: <button onclick={() => useTerm('bucle')}>bucle</button>,
				<button onclick={() => useTerm('memoria')}>memoria</button>,
				<button onclick={() => useTerm('clase')}>clase</button>.
			</p>
		</div>
	{:else}
		<div class="results-head">
			<span>
				<strong>{hits.length}</strong>
				{hits.length === 1 ? 'resultado' : 'resultados'}
				{#if tokensCount > 1}para «{q}»{/if}
			</span>
			<span class="sort">ordenados por relevancia</span>
		</div>
		<SearchResultList {hits} query={q} onSelect={logResult} />
	{/if}
</div>

<style>
	.search-page {
		max-width: 860px;
		margin: 0 auto;
		padding: 30px 30px 70px;
	}

	header {
		margin-bottom: 22px;
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
		max-width: 640px;
		font-size: 14px;
		line-height: 1.65;
		color: var(--muted);
	}

	.box {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 18px;
		padding: 6px 6px 6px 14px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--panel);
		color: var(--faint);
		box-shadow: var(--shadow);
	}
	.box:focus-within {
		border-color: color-mix(in srgb, var(--accent) 50%, var(--line));
	}
	.box input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: none;
		background: transparent;
		padding: 7px 0;
		font-size: 14.5px;
		color: var(--text);
	}
	.box input::placeholder {
		color: var(--faint);
	}
	.box .btn {
		border-radius: 8px;
		padding: 7px 14px;
	}
	.clear {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border: 0;
		background: var(--panel-3);
		border-radius: 6px;
		color: var(--muted);
		cursor: pointer;
	}

	.filters {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 5px;
		margin-top: 10px;
	}
	.filters button {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 10px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: transparent;
		color: var(--muted);
		font-size: 11.5px;
		font-weight: 550;
		cursor: pointer;
	}
	.filters button:hover {
		color: var(--text);
		background: var(--panel-2);
	}
	.filters button.on {
		background: var(--accent-soft);
		border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
		color: var(--accent);
	}
	.filters button span {
		font-family: var(--font-mono);
		font-size: 9px;
		opacity: 0.75;
	}
	.local {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin-left: auto;
		font-size: 10px;
		color: var(--faint);
	}

	.label {
		margin: 0 0 8px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--faint);
	}

	.start {
		display: flex;
		flex-direction: column;
		gap: 28px;
		margin-top: 26px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chips button {
		padding: 6px 11px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--panel);
		color: var(--text-2);
		font-size: 12px;
		cursor: pointer;
	}
	.chips button:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.courses {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.course {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2px 8px;
		padding: 15px 16px;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--panel);
		color: var(--text);
		position: relative;
	}
	.course:hover {
		text-decoration: none;
		border-color: var(--accent);
	}
	.course::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 2px;
		background: var(--py);
		border-radius: 12px 0 0 12px;
	}
	.course.cpp::before {
		background: var(--cpp);
	}
	.cn {
		font-size: 16px;
		font-weight: 650;
	}
	.cd {
		grid-column: 1;
		font-size: 11.5px;
		color: var(--muted);
	}
	.cc {
		grid-column: 1;
		margin-top: 4px;
		font-size: 10px;
		color: var(--faint);
	}
	.course :global(svg) {
		grid-row: 1 / 4;
		grid-column: 2;
		align-self: center;
		color: var(--faint);
	}

	.results-head {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
		font-size: 12px;
		color: var(--faint);
		padding: 0 2px 8px;
		border-bottom: 1px solid var(--line-soft);
		margin-bottom: 8px;
	}
	.results-head strong {
		color: var(--text);
	}
	.sort {
		font-size: 10.5px;
	}

	.empty {
		margin-top: 30px;
		padding: 40px 20px;
		border: 1px dashed var(--line);
		border-radius: 14px;
		text-align: center;
		color: var(--faint);
	}
	.empty h2 {
		margin: 10px 0 6px;
		font-size: 18px;
		color: var(--text);
	}
	.empty p {
		margin: 0 auto;
		max-width: 480px;
		font-size: 13px;
		line-height: 1.65;
	}
	.empty button {
		border: 0;
		background: transparent;
		color: var(--accent);
		font-size: 13px;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	@media (max-width: 700px) {
		.search-page {
			padding: 20px 18px 50px;
		}
		.courses {
			grid-template-columns: 1fr;
		}
		.local {
			display: none;
		}
		.box .btn {
			padding: 7px 10px;
		}
	}
</style>
