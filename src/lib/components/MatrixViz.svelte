<script lang="ts">
	import VizFrame from './VizFrame.svelte';
	import Icon from './Icon.svelte';
	import { inline } from '$lib/md';
	import type { MatrixStep } from '$lib/types';

	let {
		data,
		steps = [],
		title,
		rowLabels,
		colLabels
	}: {
		data: number[][];
		steps?: MatrixStep[];
		title?: string;
		rowLabels?: string[];
		colLabels?: string[];
	} = $props();

	let index = $state(0);
	const step = $derived(steps.length ? steps[Math.min(index, steps.length - 1)] : undefined);
	const grid = $derived(step?.data ?? data);
	const highlight = $derived(new Set((step?.highlight ?? []).map(([r, c]) => `${r},${c}`)));

	const flat = $derived(grid.flat());
	const min = $derived(Math.min(...flat));
	const max = $derived(Math.max(...flat));

	function shade(value: number): string {
		if (max === min) return 'rgba(143, 168, 255, 0.14)';
		const ratio = (value - min) / (max - min);
		if (value < 0) return `rgba(251, 113, 133, ${0.07 + ratio * 0.2})`;
		return `rgba(143, 168, 255, ${0.06 + ratio * 0.34})`;
	}

	const fmt = (value: number) =>
		Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
</script>

<VizFrame title={title ?? 'Matriz de valores'} kind="Mapa de datos" icon="grid" hint={steps.length > 1 ? 'Recorre los pasos para ver cómo cambian las celdas.' : undefined}>
	{#snippet toolbar()}
		{#if steps.length > 1}
			<div class="nav">
				<button onclick={() => (index = Math.max(0, index - 1))} disabled={index === 0} aria-label="Anterior"><Icon name="prev" size={12} /></button>
				<span>{index + 1}/{steps.length}</span>
				<button onclick={() => (index = Math.min(steps.length - 1, index + 1))} disabled={index >= steps.length - 1} aria-label="Siguiente"><Icon name="next" size={12} /></button>
			</div>
		{/if}
	{/snippet}

	<div class="shape">
		<span>{grid.length} × {grid[0]?.length ?? 0}</span>
		<span class="range">rango [{fmt(min)}, {fmt(max)}]</span>
		{#if step?.note}<span class="stepnote">{@html inline(step.note)}</span>{/if}
	</div>

	<div class="matrix-wrap">
		<div
			class="grid"
			class:has-axis={Boolean(colLabels || rowLabels)}
			style="--cols:{grid[0]?.length ?? 1}"
		>
			{#if colLabels || rowLabels}
				<div class="corner"></div>
			{/if}
			{#if colLabels}
				{#each colLabels as label}<div class="axis col">{label}</div>{/each}
			{/if}
			{#each grid as row, r}
				{#if colLabels || rowLabels}<div class="axis row">{rowLabels?.[r] ?? ''}</div>{/if}
				{#each row as value, c}
					<div
						class="cell"
						class:hl={highlight.has(`${r},${c}`)}
						style="background:{shade(value)}"
						title={`fila ${r}, columna ${c}: ${value}`}
					>
						{fmt(value)}
					</div>
				{/each}
			{/each}
		</div>
	</div>
</VizFrame>

<style>
	.shape {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 9px;
		font-size: 11px;
		color: var(--faint);
	}
	.shape > span:first-child {
		font-family: var(--font-mono);
		color: var(--text-2);
	}
	.range {
		font-family: var(--font-mono);
	}
	.stepnote {
		color: var(--muted);
		font-size: 12px;
	}

	.matrix-wrap {
		overflow-x: auto;
		padding-bottom: 3px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(var(--cols), minmax(46px, 1fr));
		gap: 4px;
		min-width: max-content;
	}

	.grid.has-axis {
		grid-template-columns: 30px repeat(var(--cols), minmax(46px, 1fr));
	}

	.axis {
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--faint);
		padding: 0 4px;
	}
	.axis.col {
		padding-bottom: 2px;
	}
	.axis.row {
		justify-content: end;
		padding-right: 7px;
	}
	.corner {
		min-width: 20px;
	}

	.cell {
		min-width: 46px;
		padding: 11px 6px;
		border-radius: 6px;
		border: 1px solid var(--line-soft);
		text-align: center;
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--text);
		transition:
			background 0.25s,
			border-color 0.2s,
			transform 0.2s;
	}
	.cell.hl {
		border-color: #ffd166;
		box-shadow: 0 0 0 2px rgba(255, 209, 102, 0.28);
		transform: scale(1.04);
		color: #ffd166;
		font-weight: 700;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 5px;
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--faint);
	}
	.nav button {
		width: 22px;
		height: 22px;
		display: grid;
		place-items: center;
		border-radius: 5px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		color: var(--text-2);
		cursor: pointer;
	}
	.nav button:disabled {
		opacity: 0.3;
	}
</style>
