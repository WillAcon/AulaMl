<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';
	import Icon from './Icon.svelte';
	import type { CodeSample } from '$lib/types';

	let {
		title,
		python,
		cpp,
		note
	}: { title?: string; python: CodeSample; cpp: CodeSample; note?: string } = $props();
</script>

<div class="compare">
	{#if title}
		<div class="title"><Icon name="layers" size={13} /> {title}</div>
	{/if}
	<div class="cols">
		<div class="col py">
			<div class="label"><span>Python</span></div>
			<CodeBlock code={python.code} lang="python" caption={python.caption} compact runnable />
		</div>
		<div class="col cpp">
			<div class="label"><span>C++</span></div>
			<CodeBlock code={cpp.code} lang="cpp" caption={cpp.caption} compact runnable={false} />
		</div>
	</div>
	{#if note}<p class="note">{note}</p>{/if}
</div>

<style>
	.compare {
		margin: 1.6rem 0 0;
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
		border-radius: 10px;
		padding: 0 0 0;
		border-top: 2px solid;
	}
	.col.py {
		border-color: var(--py);
	}
	.col.cpp {
		border-color: var(--cpp);
	}

	.label {
		padding: 6px 2px 0;
		font-size: 11px;
		font-weight: 700;
	}
	.py .label {
		color: var(--py);
	}
	.cpp .label {
		color: var(--cpp);
	}

	.note {
		margin: 10px 2px 0;
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--faint);
	}

	@media (max-width: 820px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
</style>
