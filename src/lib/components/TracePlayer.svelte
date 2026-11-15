<script lang="ts">
	import Icon from './Icon.svelte';
	import VizFrame from './VizFrame.svelte';
	import { highlight } from '$lib/highlight';
	import { inline } from '$lib/md';
	import type { TraceStep } from '$lib/types';

	let {
		code,
		steps,
		lang = 'python',
		caption,
		title
	}: {
		code: string;
		steps: TraceStep[];
		lang?: string;
		caption?: string;
		title?: string;
	} = $props();

	const lines = $derived(code.replace(/\n$/, '').split('\n'));
	const html = $derived(highlight(code, lang));

	let index = $state(0);
	let playing = $state(false);
	let codeBox = $state<HTMLDivElement | null>(null);

	const step = $derived(steps[Math.min(index, steps.length - 1)]);
	const prevStep = $derived(index > 0 ? steps[index - 1] : undefined);

	const vars = $derived(Object.entries(step?.vars ?? {}));
	const prevVars = $derived(prevStep?.vars ?? {});

	const frames = $derived(step?.frames ?? []);
	const output = $derived(
		steps
			.slice(0, index + 1)
			.map((item) => item.output ?? '')
			.join('')
	);

	const changed = (key: string, value: string) =>
		prevStep !== undefined && prevVars[key] !== value;

	let timer: ReturnType<typeof setInterval> | undefined;

	function stop() {
		playing = false;
		if (timer) clearInterval(timer);
		timer = undefined;
	}

	function play() {
		if (playing) return stop();
		if (index >= steps.length - 1) index = 0;
		playing = true;
		timer = setInterval(() => {
			if (index >= steps.length - 1) stop();
			else index += 1;
		}, 1250);
	}

	function next() {
		stop();
		index = Math.min(steps.length - 1, index + 1);
	}

	function prev() {
		stop();
		index = Math.max(0, index - 1);
	}

	function reset() {
		stop();
		index = 0;
	}

	function goto(target: number) {
		stop();
		index = Math.max(0, Math.min(steps.length - 1, target));
	}

	$effect(() => {
		index;
		codeBox;
		if (!codeBox) return;
		const active = codeBox.querySelector<HTMLElement>('.line.active');
		if (active) {
			codeBox.scrollTop = Math.max(0, active.offsetTop - codeBox.clientHeight / 2 + 16);
		}
	});

	$effect(() => () => stop());
</script>

<VizFrame title={title ?? caption ?? 'Traza paso a paso'} kind="Ejecución visual" icon="play" hint="Avanza paso a paso: observa la línea resaltada, las variables y la salida.">
	{#snippet toolbar()}
		<div class="counter">{index + 1} / {steps.length}</div>
	{/snippet}

	<div class="trace">
		<div class="code" bind:this={codeBox}>
			{#each lines as line, i}
				<div class="line" class:active={step?.line === i + 1}>
					<span class="n">{i + 1}</span>
					<code>{@html highlight(line, lang)}</code>
				</div>
			{/each}
		</div>

		<div class="side">
			{#if step?.note}
				<div class="note">{@html inline(step.note)}</div>
			{/if}

			{#if frames.length}
				<div class="panel">
					<div class="panel-title">Pila de llamadas</div>
					<div class="frames">
						{#each frames as frame, i}
							<div class="frame" class:top={i === frames.length - 1}>
								<div class="frame-name">{frame.name}()</div>
								<div class="frame-vars">
									{#each Object.entries(frame.vars) as [key, value]}
										<span><b>{key}</b> = {value}</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div class="panel">
				<div class="panel-title">Variables</div>
				{#if vars.length}
					<div class="vars">
						{#each vars as [key, value]}
							<div class="var" class:changed={changed(key, value)}>
								<span class="k">{key}</span>
								<span class="eq">=</span>
								<span class="v">{value}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="empty">Sin variables en este paso.</p>
				{/if}
			</div>

			<div class="panel">
				<div class="panel-title">Salida</div>
				<pre class="output">{output || '—'}</pre>
			</div>
		</div>
	</div>

	<div class="controls">
		<button class="ctl" onclick={reset} aria-label="Reiniciar" title="Reiniciar">
			<Icon name="reset" size={15} />
		</button>
		<button class="ctl" onclick={prev} disabled={index === 0} aria-label="Paso anterior">
			<Icon name="prev" size={15} />
		</button>
		<button class="ctl main" onclick={play} aria-label={playing ? 'Pausar' : 'Reproducir'}>
			<Icon name={playing ? 'pause' : 'play'} size={15} />
			<span>{playing ? 'Pausar' : 'Reproducir'}</span>
		</button>
		<button class="ctl" onclick={next} disabled={index >= steps.length - 1} aria-label="Paso siguiente">
			<Icon name="next" size={15} />
		</button>

		<div class="dots" role="tablist" aria-label="Pasos">
			{#each steps as _, i}
				<button
					class="dot"
					class:on={i <= index}
					onclick={() => goto(i)}
					aria-label={`Ir al paso ${i + 1}`}
					aria-selected={i === index}
					role="tab"
				></button>
			{/each}
		</div>
	</div>
</VizFrame>

<style>
	.trace {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
		gap: 12px;
	}

	.code {
		max-height: 330px;
		overflow: auto;
		border: 1px solid var(--line);
		border-radius: 9px;
		background: var(--code-bg);
		padding: 8px 0;
		position: relative;
	}

	.line {
		display: flex;
		gap: 8px;
		padding: 2px 12px 2px 0;
		font-family: var(--font-mono);
		font-size: 12.8px;
		line-height: 1.65;
		border-left: 2px solid transparent;
		color: #c9d6ee;
		min-width: max-content;
		transition: background 0.18s;
	}

	.line.active {
		background: rgba(255, 209, 102, 0.1);
		border-left-color: #ffd166;
	}

	.n {
		width: 22px;
		flex: none;
		text-align: right;
		color: #40506b;
		user-select: none;
	}

	.line.active .n {
		color: #ffd166;
		font-weight: 700;
	}

	.line code {
		white-space: pre;
	}

	.line :global(.tk-com) {
		color: #5d7191;
		font-style: italic;
	}
	.line :global(.tk-str) {
		color: #9ae6b4;
	}
	.line :global(.tk-num) {
		color: #f6ad9b;
	}
	.line :global(.tk-kw) {
		color: #c3a6ff;
	}
	.line :global(.tk-bi) {
		color: #82c7ff;
	}
	.line :global(.tk-fn) {
		color: #ffd166;
	}

	.side {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	.note {
		padding: 8px 10px;
		border-radius: 8px;
		background: var(--accent-soft);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--text-2);
	}

	.panel {
		border: 1px solid var(--line);
		border-radius: 9px;
		background: var(--panel-2);
		padding: 8px 10px;
	}

	.panel-title {
		font-size: 9.5px;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--faint);
		margin-bottom: 6px;
	}

	.vars {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.var {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-family: var(--font-mono);
		font-size: 12.2px;
		padding: 2px 5px;
		border-radius: 5px;
		transition: background 0.25s;
		overflow-x: auto;
	}

	.var.changed {
		background: rgba(255, 209, 102, 0.13);
		animation: flash 0.9s ease;
	}

	@keyframes flash {
		from {
			background: rgba(255, 209, 102, 0.4);
		}
	}

	.k {
		color: #82c7ff;
		font-weight: 600;
	}
	.eq {
		color: var(--faint);
	}
	.v {
		color: var(--text);
		white-space: pre;
	}

	.frames {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.frame {
		border-left: 2px solid var(--line);
		padding-left: 7px;
	}
	.frame.top {
		border-left-color: var(--accent);
	}

	.frame-name {
		font-family: var(--font-mono);
		font-size: 11.5px;
		color: var(--accent);
		font-weight: 600;
	}

	.frame-vars {
		display: flex;
		flex-wrap: wrap;
		gap: 3px 8px;
		font-family: var(--font-mono);
		font-size: 10.8px;
		color: var(--muted);
	}
	.frame-vars b {
		color: var(--text-2);
		font-weight: 500;
	}

	.output {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 11.8px;
		line-height: 1.55;
		color: var(--ok);
		white-space: pre-wrap;
		max-height: 90px;
		overflow: auto;
	}

	.empty {
		margin: 0;
		font-size: 11.5px;
		color: var(--faint);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-top: 11px;
	}

	.counter {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--faint);
		padding: 2px 7px;
		border: 1px solid var(--line);
		border-radius: 5px;
	}

	.ctl {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		height: 30px;
		min-width: 30px;
		padding: 0 8px;
		border-radius: 7px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		color: var(--text-2);
		font-size: 11.5px;
		font-weight: 600;
		cursor: pointer;
	}
	.ctl:hover:not(:disabled) {
		background: var(--panel-3);
		color: var(--text);
	}
	.ctl:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.ctl.main {
		background: var(--accent);
		border-color: var(--accent);
		color: #07101f;
	}
	.ctl.main:hover {
		background: var(--accent);
		color: #07101f;
		filter: brightness(1.06);
	}

	.dots {
		display: flex;
		gap: 3px;
		margin-left: auto;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.dot {
		width: 14px;
		height: 5px;
		border: 0;
		border-radius: 3px;
		background: var(--line);
		cursor: pointer;
		padding: 0;
		transition: background 0.2s;
	}
	.dot.on {
		background: color-mix(in srgb, var(--accent) 55%, transparent);
	}

	@media (max-width: 760px) {
		.trace {
			grid-template-columns: 1fr;
		}
		.code {
			max-height: 240px;
		}
		.ctl.main span {
			display: none;
		}
		.dots {
			display: none;
		}
	}
</style>
