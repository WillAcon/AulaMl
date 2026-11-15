<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';
	import Icon from './Icon.svelte';
	import type { CodeSample } from '$lib/types';

	let {
		title,
		wrong,
		right,
		explain
	}: { title?: string; wrong: CodeSample; right: CodeSample; explain?: string } = $props();
</script>

<div class="diff">
	{#if title}<div class="title"><Icon name="alert" size={13} /> {title}</div>{/if}
	<div class="cols">
		<div class="col bad">
			<div class="label"><Icon name="close" size={12} /> Incorrecto</div>
			<CodeBlock code={wrong.code} lang={wrong.lang ?? 'python'} caption={wrong.caption} compact runnable={false} />
		</div>
		<div class="col good">
			<div class="label"><Icon name="check" size={12} /> Correcto</div>
			<CodeBlock code={right.code} lang={right.lang ?? 'python'} caption={right.caption} compact runnable={false} />
		</div>
	</div>
	{#if explain}<p class="explain">{explain}</p>{/if}
</div>

<style>
	.diff {
		margin: 1.5rem 0 0;
		border: 1px solid var(--line);
		border-radius: 14px;
		background: var(--panel);
		padding: 12px;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
		color: var(--muted);
		margin-bottom: 9px;
	}

	.cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.col {
		min-width: 0;
		border-top: 2px solid;
		border-radius: 10px;
	}
	.bad {
		border-color: var(--danger);
	}
	.good {
		border-color: var(--ok);
	}

	.label {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 2px 0;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.bad .label {
		color: var(--danger);
	}
	.good .label {
		color: var(--ok);
	}

	.explain {
		margin: 10px 2px 0;
		font-size: 13px;
		line-height: 1.65;
		color: var(--text-2);
	}

	@media (max-width: 820px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
</style>
