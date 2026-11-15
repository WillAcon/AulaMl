<script lang="ts">
	import Icon from './Icon.svelte';
	import { inline } from '$lib/md';
	import { progress } from '$lib/progress.svelte';
	import { onMount } from 'svelte';

	let {
		question,
		options,
		answer,
		explain,
		storageKey,
		number
	}: {
		question: string;
		options: string[];
		answer: number;
		explain?: string;
		storageKey: string;
		number?: number;
	} = $props();

	let mounted = $state(false);
	onMount(() => (mounted = true));

	const picked = $derived(mounted ? (progress.quizAnswer(storageKey) ?? -1) : -1);
	const answered = $derived(picked >= 0);
	const correct = $derived(picked === answer);

	function choose(index: number) {
		progress.setQuizAnswer(storageKey, index);
	}

	function retry() {
		progress.clearQuizAnswer(storageKey);
	}
</script>

<div class="quiz" class:correct>
	<div class="head">
		<span class="badge"><Icon name="target" size={13} /> Evaluación{number ? ` ${number}` : ''}</span>
		{#if answered}
			<span class="state" class:ok={correct} class:ko={!correct}>
				<Icon name={correct ? 'check' : 'close'} size={12} />
				{correct ? 'Correcto' : 'Revisa el concepto'}
			</span>
		{/if}
	</div>

	<p class="question">{@html inline(question)}</p>

	<div class="options">
		{#each options as option, index}
			<button
				class="option"
				class:chosen={picked === index}
				class:right={answered && index === answer}
				class:wrong={answered && picked === index && index !== answer}
				onclick={() => choose(index)}
				aria-pressed={picked === index}
			>
				<span class="letter">{String.fromCharCode(65 + index)}</span>
				<span class="text">{@html inline(option)}</span>
				{#if answered && index === answer}<Icon name="check" size={15} />{/if}
				{#if answered && picked === index && index !== answer}<Icon name="close" size={15} />{/if}
			</button>
		{/each}
	</div>

	{#if answered && explain}
		<div class="explain">
			<span class="etitle"><Icon name="bulb" size={13} /> Por qué</span>
			<div>{@html inline(explain)}</div>
		</div>
	{/if}

	{#if answered}
		<div class="foot">
			<button class="retry" onclick={retry}><Icon name="reset" size={12} /> Intentar de nuevo</button>
		</div>
	{/if}
</div>

<style>
	.quiz {
		margin: 1.6rem 0 0;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--panel);
		padding: 15px 16px 14px;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 9px;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--accent);
	}

	.state {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 10.5px;
		font-weight: 650;
		padding: 2px 7px;
		border-radius: 999px;
	}
	.state.ok {
		color: var(--ok);
		background: var(--ok-soft);
	}
	.state.ko {
		color: var(--danger);
		background: var(--danger-soft);
	}

	.question {
		margin: 0 0 11px;
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		line-height: 1.55;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.option {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		width: 100%;
		text-align: left;
		padding: 9px 11px;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		color: var(--text-2);
		font-size: 13.5px;
		line-height: 1.5;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s;
	}
	.option:hover {
		background: var(--panel-3);
		border-color: color-mix(in srgb, var(--accent) 35%, var(--line));
	}

	.letter {
		flex: none;
		display: grid;
		place-items: center;
		width: 20px;
		height: 20px;
		border-radius: 5px;
		background: var(--panel-3);
		border: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 10.5px;
		font-weight: 700;
		color: var(--muted);
		margin-top: 1px;
	}

	.text {
		flex: 1;
	}
	.text :global(code) {
		font-size: 12.5px;
		padding: 1px 4px;
		border-radius: 4px;
		background: var(--panel-3);
	}

	.option.right {
		border-color: color-mix(in srgb, var(--ok) 55%, transparent);
		background: var(--ok-soft);
		color: var(--text);
	}
	.option.right .letter {
		background: var(--ok);
		border-color: var(--ok);
		color: #04120c;
	}
	.option.right :global(svg) {
		color: var(--ok);
		flex: none;
		margin-top: 3px;
	}

	.option.wrong {
		border-color: color-mix(in srgb, var(--danger) 55%, transparent);
		background: var(--danger-soft);
	}
	.option.wrong .letter {
		background: var(--danger);
		border-color: var(--danger);
		color: #fff;
	}
	.option.wrong :global(svg) {
		color: var(--danger);
		flex: none;
		margin-top: 3px;
	}

	.option.chosen:not(.right):not(.wrong) {
		border-color: var(--accent);
	}

	.explain {
		margin-top: 11px;
		padding: 10px 12px;
		border-radius: 8px;
		border-left: 3px solid var(--accent);
		background: var(--accent-soft);
		font-size: 13px;
		line-height: 1.6;
		color: var(--text-2);
	}

	.etitle {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 3px;
	}

	.foot {
		margin-top: 8px;
	}

	.retry {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		border: 0;
		background: transparent;
		color: var(--faint);
		font-size: 11.5px;
		cursor: pointer;
		padding: 2px 0;
	}
	.retry:hover {
		color: var(--text-2);
	}
</style>
