<script lang="ts">
	import Icon from './Icon.svelte';
	import CodeBlock from './CodeBlock.svelte';
	import { inline } from '$lib/md';
	import { progress } from '$lib/progress.svelte';
	import { onMount } from 'svelte';

	let {
		title,
		md,
		hint,
		solution,
		storageKey,
		number
	}: {
		title: string;
		md: string;
		hint?: string;
		solution: { lang?: string; code: string; explain?: string; caption?: string };
		storageKey: string;
		number?: number;
	} = $props();

	let open = $state(false);
	let mounted = $state(false);
	onMount(() => (mounted = true));

	const solved = $derived(mounted && (progress.quizAnswer(storageKey) ?? 0) === 1);

	function toggleSolved() {
		progress.setQuizAnswer(storageKey, solved ? 0 : 1);
	}
</script>

<div class="exercise" class:solved>
	<div class="head">
		<span class="badge"><Icon name="pencil" size={12} /> Ejercicio{number ? ` ${number}` : ''}</span>
		{#if solved}<span class="done"><Icon name="check" size={11} /> resuelto</span>{/if}
	</div>

	<h4>{title}</h4>
	<div class="statement">{@html inline(md)}</div>

	{#if hint}
		<details class="hint">
			<summary><Icon name="bulb" size={12} /> Pista</summary>
			<p>{@html inline(hint)}</p>
		</details>
	{/if}

	<div class="actions">
		<button class="btn sm" onclick={() => (open = !open)} aria-expanded={open}>
			<Icon name={open ? 'close' : 'code'} size={12} />
			{open ? 'Ocultar solución' : 'Ver solución'}
		</button>
		<button class="btn sm ghost" onclick={toggleSolved}>
			<Icon name={solved ? 'check' : 'target'} size={12} />
			{solved ? 'Resuelto' : 'Marcar resuelto'}
		</button>
	</div>

	{#if open}
		<div class="solution">
			<CodeBlock code={solution.code} lang={solution.lang ?? 'python'} caption={solution.caption ?? 'Solución'} compact />
			{#if solution.explain}
				<div class="explain">{@html inline(solution.explain)}</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.exercise {
		margin: 1.5rem 0 0;
		border: 1px solid var(--line);
		border-radius: 13px;
		background: var(--panel);
		padding: 14px 15px 13px;
		position: relative;
	}
	.exercise.solved {
		border-color: color-mix(in srgb, var(--ok) 30%, var(--line));
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 5px;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 9.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
		color: #ffd166;
	}

	.done {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 10px;
		font-weight: 650;
		color: var(--ok);
		background: var(--ok-soft);
		padding: 1px 7px;
		border-radius: 999px;
	}

	h4 {
		margin: 0 0 5px;
		font-size: 15.5px;
		color: var(--text);
	}

	.statement {
		font-size: 14px;
		line-height: 1.65;
		color: var(--text-2);
	}

	.hint {
		margin-top: 9px;
		font-size: 12px;
		color: var(--muted);
	}
	.hint summary {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		cursor: pointer;
		color: var(--accent);
		font-weight: 600;
	}
	.hint p {
		margin: 5px 0 0;
		padding: 7px 9px;
		background: var(--panel-2);
		border-radius: 7px;
		line-height: 1.55;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin-top: 10px;
	}

	.solution {
		margin-top: 11px;
		border-top: 1px dashed var(--line);
		padding-top: 11px;
	}

	.explain {
		margin-top: 10px;
		font-size: 13px;
		line-height: 1.65;
		color: var(--text-2);
		padding-left: 10px;
		border-left: 2px solid var(--line);
	}
</style>
