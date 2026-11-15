<script lang="ts">
	import VizFrame from './VizFrame.svelte';
	import Icon from './Icon.svelte';
	import { highlight } from '$lib/highlight';
	import { inline } from '$lib/md';
	import type { MemoryStep } from '$lib/types';

	let {
		steps,
		code,
		title,
		lang = 'cpp'
	}: {
		steps: MemoryStep[];
		code?: string;
		title?: string;
		lang?: string;
	} = $props();

	let index = $state(0);
	const step = $derived(steps[Math.min(index, steps.length - 1)]);
	const stack = $derived(step?.stack ?? []);
	const heap = $derived(step?.heap ?? []);
	const arrows = $derived(step?.arrows ?? []);
	const highlighted = $derived(new Set(step?.highlight ?? []));
	const output = $derived(
		steps
			.slice(0, index + 1)
			.map((item) => item.note ?? '')
			.filter(Boolean)
			.at(-1) ?? ''
	);

	function next() {
		index = Math.min(steps.length - 1, index + 1);
	}
	function prev() {
		index = Math.max(0, index - 1);
	}
</script>

<VizFrame title={title ?? 'Stack, heap y direcciones'} kind="Mapa de memoria" icon="layers" hint="Cada paso muestra qué vive en el stack, qué se reserva en el heap y cómo apunta cada variable.">
	{#snippet toolbar()}
		<div class="stepnav">
			<button onclick={prev} disabled={index === 0} aria-label="Anterior"><Icon name="prev" size={13} /></button>
			<span>{index + 1}/{steps.length}</span>
			<button onclick={next} disabled={index >= steps.length - 1} aria-label="Siguiente"><Icon name="next" size={13} /></button>
		</div>
	{/snippet}

	<div class="memory">
		<div class="zone">
			<div class="zone-title"><span class="tag stack">STACK</span> memoria automática</div>
			<div class="cells">
				{#each stack as cell}
					<div class="cell" class:hl={highlighted.has(cell.name)}>
						<div class="cell-top">
							<span class="name">{cell.name}</span>
							{#if cell.addr}<span class="addr">{cell.addr}</span>{/if}
						</div>
						<div class="value">{cell.value}</div>
						{#if cell.type}<div class="type">{cell.type}</div>{/if}
					</div>
				{:else}
					<p class="empty">vacío</p>
				{/each}
			</div>
		</div>

		<div class="divider"><span>↕</span></div>

		<div class="zone">
			<div class="zone-title"><span class="tag heap">HEAP</span> memoria dinámica</div>
			<div class="cells">
				{#each heap as cell}
					<div class="cell heap-cell" class:hl={highlighted.has(cell.name)}>
						<div class="cell-top">
							<span class="name">{cell.name}</span>
							{#if cell.addr}<span class="addr">{cell.addr}</span>{/if}
						</div>
						<div class="value">{cell.value}</div>
						{#if cell.type}<div class="type">{cell.type}</div>{/if}
					</div>
				{:else}
					<p class="empty">vacío</p>
				{/each}
			</div>
		</div>
	</div>

	{#if arrows.length}
		<div class="arrows">
			{#each arrows as arrow}
				<div class="arrow">
					<code>{arrow.from}</code>
					<span class="line">──▶</span>
					<code class="to">{arrow.to}</code>
					{#if arrow.label}<span class="alabel">{arrow.label}</span>{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if step?.note}<div class="note">{@html inline(step.note)}</div>{/if}
	{#if output && steps.length > 1}<div class="log"><span>última acción:</span> {output}</div>{/if}
	{#if code}
		<details class="src">
			<summary>Ver código de esta simulación</summary>
			<pre><code>{@html highlight(code, lang)}</code></pre>
		</details>
	{/if}
</VizFrame>

<style>
	.memory {
		display: grid;
		grid-template-columns: 1fr 24px 1fr;
		gap: 6px;
		align-items: stretch;
	}

	.zone {
		border: 1px solid var(--line);
		border-radius: 9px;
		background: var(--panel-2);
		padding: 9px;
		min-height: 108px;
	}

	.zone-title {
		font-size: 10px;
		color: var(--faint);
		letter-spacing: 0.03em;
		margin-bottom: 7px;
	}

	.tag {
		font-family: var(--font-mono);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: 1px 5px;
		border-radius: 3px;
		margin-right: 4px;
	}
	.tag.stack {
		background: rgba(255, 209, 102, 0.14);
		color: #ffd166;
	}
	.tag.heap {
		background: rgba(116, 185, 255, 0.14);
		color: #74b9ff;
	}

	.cells {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.cell {
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--panel-3);
		padding: 5px 7px;
		transition:
			border-color 0.2s,
			background 0.2s;
	}
	.cell.hl {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.heap-cell {
		border-style: dashed;
	}

	.cell-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 6px;
	}

	.name {
		font-family: var(--font-mono);
		font-size: 11.5px;
		font-weight: 600;
		color: #82c7ff;
	}
	.addr {
		font-family: var(--font-mono);
		font-size: 9px;
		color: var(--faint);
	}

	.value {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text);
		word-break: break-word;
	}

	.type {
		font-size: 9.5px;
		color: var(--faint);
	}

	.divider {
		display: grid;
		place-items: center;
		color: var(--faint);
		font-size: 12px;
	}

	.empty {
		margin: 0;
		font-size: 10.5px;
		color: var(--faint);
		font-style: italic;
	}

	.arrows {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
		margin-top: 10px;
		padding: 7px 9px;
		border-radius: 7px;
		border: 1px dashed var(--line);
	}

	.arrow {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
	}
	.arrow code {
		font-size: 11px;
		color: #82c7ff;
	}
	.arrow .to {
		color: var(--text);
	}
	.line {
		color: #ffd166;
		letter-spacing: -1px;
	}
	.alabel {
		color: var(--faint);
		font-size: 10px;
	}

	.note {
		margin-top: 10px;
		padding: 8px 10px;
		border-radius: 7px;
		background: var(--accent-soft);
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--text-2);
	}

	.log {
		margin-top: 7px;
		font-size: 11px;
		color: var(--muted);
	}
	.log span {
		color: var(--faint);
	}

	.stepnav {
		display: flex;
		align-items: center;
		gap: 5px;
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--faint);
	}
	.stepnav button {
		width: 24px;
		height: 24px;
		display: grid;
		place-items: center;
		border-radius: 5px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		color: var(--text-2);
		cursor: pointer;
	}
	.stepnav button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.src {
		margin-top: 9px;
		font-size: 11px;
		color: var(--faint);
	}
	.src summary {
		cursor: pointer;
	}
	.src pre {
		margin: 6px 0 0;
		padding: 9px;
		background: var(--code-bg);
		border-radius: 7px;
		overflow-x: auto;
		font-size: 11.5px;
		color: #c9d6ee;
	}
	.src :global(.tk-com) {
		color: #5d7191;
		font-style: italic;
	}
	.src :global(.tk-str) {
		color: #9ae6b4;
	}
	.src :global(.tk-num) {
		color: #f6ad9b;
	}
	.src :global(.tk-kw) {
		color: #c3a6ff;
	}
	.src :global(.tk-bi) {
		color: #82c7ff;
	}

	@media (max-width: 640px) {
		.memory {
			grid-template-columns: 1fr;
		}
		.divider {
			display: none;
		}
	}
</style>
