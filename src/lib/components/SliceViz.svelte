<script lang="ts">
	import VizFrame from './VizFrame.svelte';
	import Icon from './Icon.svelte';
	import { untrack } from 'svelte';

	let {
		string: text,
		start: initialStart,
		stop: initialStop,
		step: initialStep = 1,
		title,
		note
	}: {
		string: string;
		start?: number;
		stop?: number;
		step?: number;
		title?: string;
		note?: string;
	} = $props();

	const chars = $derived([...text]);
	const n = $derived(chars.length);

	let startInput = $state(untrack(() => (initialStart === undefined ? '' : String(initialStart))));
	let stopInput = $state(untrack(() => (initialStop === undefined ? '' : String(initialStop))));
	let stepInput = $state(untrack(() => String(initialStep)));

	const parse = (value: string): number | undefined => {
		if (value.trim() === '' || value.trim() === '-') return undefined;
		const parsed = Number(value);
		return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
	};

	const start = $derived(parse(startInput));
	const stop = $derived(parse(stopInput));
	const step = $derived(parse(stepInput) ?? 1);

	function indicesFor(len: number, rawStart?: number, rawStop?: number, rawStep = 1): number[] {
		if (rawStep === 0) return [];
		const result: number[] = [];
		if (rawStep > 0) {
			let s = rawStart === undefined ? 0 : rawStart < 0 ? len + rawStart : rawStart;
			let e = rawStop === undefined ? len : rawStop < 0 ? len + rawStop : rawStop;
			s = Math.max(0, Math.min(len, s));
			e = Math.max(0, Math.min(len, e));
			for (let i = s; i < e; i += rawStep) result.push(i);
		} else {
			let s = rawStart === undefined ? len - 1 : rawStart < 0 ? len + rawStart : rawStart;
			let e = rawStop === undefined ? -1 : rawStop < 0 ? len + rawStop : rawStop;
			s = Math.max(-1, Math.min(len - 1, s));
			e = Math.max(-1, Math.min(len - 1, e));
			for (let i = s; i > e; i += rawStep) result.push(i);
		}
		return result;
	}

	const selected = $derived(indicesFor(n, start, stop, step));
	const selectedSet = $derived(new Set(selected));
	const result = $derived(selected.map((i) => chars[i]).join(''));

	const exprStart = $derived(startInput.trim());
	const exprStop = $derived(stopInput.trim());
	const exprStep = $derived(stepInput.trim());
	const expression = $derived(
		`cadena[${exprStart}:${exprStop}${exprStep && exprStep !== '1' ? ':' + exprStep : ''}]`
	);

	const direction = $derived(step >= 0 ? 'izquierda a derecha →' : '← de derecha a izquierda');
	const startNorm = $derived(
		start === undefined ? undefined : start < 0 ? n + start : start
	);

	function reset() {
		startInput = initialStart === undefined ? '' : String(initialStart);
		stopInput = initialStop === undefined ? '' : String(initialStop);
		stepInput = String(initialStep);
	}

	function clickCell(index: number, event: MouseEvent) {
		if (event.shiftKey) stopInput = String(index);
		else startInput = String(index);
	}
</script>

<VizFrame title={title ?? 'Índices, inicio, fin y salto'} kind="Slicing interactivo" icon="grid" hint="Haz clic en un carácter para fijar el inicio; con Shift+clic fijas el fin. Ajusta el salto para ver el recorrido.">
	{#snippet toolbar()}
		<button class="mini" onclick={reset}><Icon name="reset" size={12} /> Reiniciar</button>
	{/snippet}

	<div class="expression"><code>{expression}</code><span class="arrow">=</span><span class="result">'{result}'</span></div>

	<div class="ruler">
		<div class="indices pos">
			{#each chars as _, i}<span class:sel={selectedSet.has(i)} class:boundary={i === start}>{i}</span>{/each}
		</div>
		<div class="cells">
			{#each chars as char, i}
				<button
					class="cell"
					class:sel={selectedSet.has(i)}
					class:start={i === startNorm}
					onclick={(event) => clickCell(i, event)}
					aria-label={`Carácter ${i}: ${char}`}
				>
					{char}
				</button>
			{/each}
		</div>
		<div class="indices neg">
			{#each chars as _, i}<span class:sel={selectedSet.has(i)}>{i - n}</span>{/each}
		</div>
	</div>

	<div class="controls">
		<label>
			<span>inicio</span>
			<input bind:value={startInput} type="number" placeholder="auto" />
		</label>
		<label>
			<span>fin</span>
			<input bind:value={stopInput} type="number" placeholder="auto" />
		</label>
		<label>
			<span>salto</span>
			<input bind:value={stepInput} type="number" min="-5" max="5" />
		</label>
		<div class="dir"><Icon name="arrowRight" size={13} /> {direction}</div>
	</div>

	<div class="legend">
		<span><i class="sw sel"></i> seleccionados: {selected.length}</span>
		<span><i class="sw st"></i> inicio: {start ?? 'auto'}</span>
		<span><i class="sw en"></i> fin (exclusivo): {stop ?? 'auto'}</span>
		<span class="note">Paso de {step}</span>
	</div>
	{#if step === 0}
		<p class="warn">Un salto de 0 no es válido en Python: el recorrido no avanzaría.</p>
	{/if}
	{#if note}<p class="note-text">{note}</p>{/if}
</VizFrame>

<style>
	.expression {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		padding: 9px 12px;
		margin-bottom: 12px;
		border-radius: 8px;
		background: var(--code-bg);
		border: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 13px;
		color: #c9d6ee;
	}
	.expression code {
		color: #ffd166;
	}
	.arrow {
		color: var(--faint);
	}
	.result {
		color: var(--ok);
		font-weight: 600;
	}

	.ruler {
		display: flex;
		flex-direction: column;
		gap: 3px;
		overflow-x: auto;
		padding-bottom: 3px;
	}

	.indices,
	.cells {
		display: flex;
		gap: 0;
		min-width: max-content;
	}

	.indices span {
		width: 34px;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 10.5px;
		color: var(--faint);
		flex: none;
	}
	.indices span.sel {
		color: var(--text-2);
	}
	.indices.pos span.boundary {
		color: #ffd166;
		font-weight: 700;
	}
	.indices.neg {
		color: var(--faint);
		opacity: 0.75;
	}

	.cell {
		width: 34px;
		height: 38px;
		flex: none;
		display: grid;
		place-items: center;
		border: 1px solid var(--line);
		margin-left: -1px;
		background: var(--panel-2);
		color: var(--text-2);
		font-family: var(--font-mono);
		font-size: 15px;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.cell:first-child {
		border-radius: 7px 0 0 7px;
		margin-left: 0;
	}
	.cell:last-child {
		border-radius: 0 7px 7px 0;
	}
	.cell:hover {
		background: var(--panel-3);
		color: var(--text);
		z-index: 1;
	}
	.cell.sel {
		background: rgba(255, 209, 102, 0.18);
		border-color: rgba(255, 209, 102, 0.55);
		color: #ffd166;
		font-weight: 650;
		z-index: 1;
	}
	.cell.start {
		outline: 2px solid #ffd166;
		outline-offset: -2px;
	}

	.controls {
		display: flex;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 14px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	label span {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-weight: 700;
		color: var(--faint);
	}

	input {
		width: 78px;
		padding: 6px 8px;
		border-radius: 7px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		font-family: var(--font-mono);
		font-size: 12.5px;
	}
	input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.dir {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		color: var(--muted);
		padding-bottom: 7px;
	}

	.legend {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 11px;
		font-size: 11px;
		color: var(--muted);
	}

	.sw {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 3px;
		margin-right: 4px;
		vertical-align: -1px;
	}
	.sw.sel {
		background: rgba(255, 209, 102, 0.5);
		border: 1px solid #ffd166;
	}
	.sw.st {
		border: 2px solid #ffd166;
	}
	.sw.en {
		border: 1px dashed var(--faint);
	}

	.note {
		margin-left: auto;
		font-family: var(--font-mono);
	}

	.warn {
		margin: 9px 0 0;
		font-size: 12px;
		color: var(--warn);
		line-height: 1.5;
	}

	.note-text {
		margin: 9px 0 0;
		font-size: 12px;
		color: var(--faint);
		line-height: 1.55;
	}

	.mini {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: transparent;
		color: var(--muted);
		font-size: 10.5px;
		font-weight: 600;
		cursor: pointer;
	}
	.mini:hover {
		color: var(--text);
		background: var(--panel-3);
	}

	@media (max-width: 560px) {
		.cell {
			width: 27px;
			height: 33px;
			font-size: 13px;
		}
		.indices span {
			width: 27px;
			font-size: 9px;
		}
		.note {
			margin-left: 0;
		}
	}
</style>
