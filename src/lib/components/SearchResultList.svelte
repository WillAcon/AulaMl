<script lang="ts">
	import Icon from './Icon.svelte';
	import { highlightText } from '$lib/md';
	import { tokenize } from '$lib/search';
	import type { SearchHit } from '$lib/types';

	let {
		hits,
		query,
		compact = false,
		active = -1,
		onNavigate
	}: {
		hits: SearchHit[];
		query: string;
		compact?: boolean;
		active?: number;
		onNavigate?: () => void;
	} = $props();

	const tokens = $derived(tokenize(query));
	const url = (hit: SearchHit) =>
		`/${hit.doc.track}/${hit.doc.id}/${hit.sectionId && hit.sectionId !== 'inicio' ? `#${hit.sectionId}` : ''}`;
</script>

<ul class="results" class:compact>
	{#each hits as hit, index}
		<li>
			<a
				href={url(hit)}
				class:active={index === active}
				onclick={onNavigate}
				aria-current={index === active ? 'true' : undefined}
			>
				<div class="meta">
					<span class="track {hit.doc.track}">{hit.doc.track === 'python' ? 'Python' : 'C++'}</span>
					<span class="module">{hit.doc.module}</span>
					<span class="level">{hit.doc.level}</span>
				</div>
				<div class="title">{@html highlightText(hit.doc.title, tokens)}</div>
				<p class="snippet">{@html highlightText(hit.snippet, tokens)}</p>
				{#if !compact && hit.sectionId && hit.sectionId !== 'inicio'}
					<span class="anchor">↳ {hit.doc.sections.find((s) => s.id === hit.sectionId)?.heading}</span>
				{/if}
				<span class="go"><Icon name="arrowRight" size={13} /></span>
			</a>
		</li>
	{/each}
</ul>

<style>
	.results {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	li {
		margin: 0;
	}

	a {
		display: block;
		position: relative;
		padding: 10px 34px 10px 12px;
		border-radius: 9px;
		border: 1px solid transparent;
		color: var(--text);
		text-decoration: none;
		transition:
			background 0.12s,
			border-color 0.12s;
	}
	a:hover,
	a.active {
		background: var(--panel-2);
		border-color: var(--line);
		text-decoration: none;
	}
	a.active {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
		background: var(--accent-soft);
	}

	.meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 3px;
	}

	.track {
		font-size: 9px;
		font-weight: 750;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		padding: 1px 5px;
		border-radius: 3px;
	}
	.track.python {
		color: var(--py);
		background: var(--py-soft);
	}
	.track.cpp {
		color: var(--cpp);
		background: var(--cpp-soft);
	}

	.module,
	.level {
		font-size: 10px;
		color: var(--faint);
	}
	.level {
		text-transform: capitalize;
	}
	.level::before,
	.module::before {
		content: '·';
		margin-right: 6px;
		color: var(--line);
	}

	.title {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.4;
	}

	.snippet {
		margin: 2px 0 0;
		font-size: 12px;
		line-height: 1.55;
		color: var(--muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.anchor {
		display: inline-block;
		margin-top: 4px;
		font-size: 10.5px;
		color: var(--accent);
	}

	.go {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--faint);
		opacity: 0;
		transition: opacity 0.12s;
	}
	a:hover .go,
	a.active .go {
		opacity: 1;
	}

	.compact a {
		padding-top: 9px;
		padding-bottom: 9px;
	}
	.compact .snippet {
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}

	:global(mark) {
		background: var(--mark);
		color: var(--mark-text);
		padding: 0 1px;
		border-radius: 2px;
	}
</style>
