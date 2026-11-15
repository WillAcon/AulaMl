<script lang="ts">
	import Icon from './Icon.svelte';
	import { highlight } from '$lib/highlight';
	import { runPython } from '$lib/pyodide';

	let {
		code,
		lang = 'python',
		caption,
		highlight: highlightLines = [],
		runnable = true,
		compact = false
	}: {
		code: string;
		lang?: string;
		caption?: string;
		highlight?: number[];
		runnable?: boolean;
		compact?: boolean;
	} = $props();

	const isPython = $derived(lang === 'python' || lang === 'py');
	const isShell = $derived(lang === 'shell');
	const html = $derived(highlight(code, lang));
	const lines = $derived(code.replace(/\n$/, '').split('\n'));

	let copied = $state(false);
	let open = $state(false);
	let instructions = $state(false);
	let cmdCopied = $state(false);
	let source = $state(code);
	let running = $state(false);
	let status = $state('');
	let output = $state('');
	let error = $state('');
	let ms = $state(0);

	$effect(() => {
		source = code;
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 1600);
		} catch {
			/* clipboard bloqueado */
		}
	}

	async function copyCommand() {
		try {
			await navigator.clipboard.writeText('g++ -std=c++20 -O2 -Wall main.cpp -o main\n./main');
			cmdCopied = true;
			setTimeout(() => (cmdCopied = false), 1600);
		} catch {
			/* clipboard bloqueado */
		}
	}

	async function execute() {
		if (running) return;
		running = true;
		error = '';
		output = '';
		status = 'Preparando Python…';
		try {
			const result = await runPython(source, (message) => (status = message));
			output = result.output;
			error = result.error ?? '';
			ms = result.ms;
			status = '';
		} catch (err) {
			error =
				'No se pudo cargar el intérprete. Necesitas conexión a internet la primera vez. ' +
				(err instanceof Error ? err.message : String(err));
			status = '';
		} finally {
			running = false;
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Tab') {
			event.preventDefault();
			const target = event.currentTarget as HTMLTextAreaElement;
			const start = target.selectionStart;
			const end = target.selectionEnd;
			source = source.slice(0, start) + '    ' + source.slice(end);
			requestAnimationFrame(() => {
				target.selectionStart = target.selectionEnd = start + 4;
			});
		}
	}
</script>

<figure class="code-block" class:compact>
	<div class="bar">
		<div class="left">
			<span class="lang" class:py={isPython} class:cpp={!isPython}>
				{isPython ? 'PYTHON' : lang.toUpperCase()}
			</span>
			{#if caption}<span class="caption">{caption}</span>{/if}
		</div>
		<div class="actions">
			{#if runnable && isPython}
				<button class="action" onclick={() => (open = !open)} aria-expanded={open}>
					<Icon name="terminal" size={14} />
					<span>{open ? 'Ocultar' : 'Probar'}</span>
				</button>
			{:else if runnable && !isShell}
				<button class="action" onclick={() => (instructions = !instructions)} aria-expanded={instructions}>
					<Icon name="terminal" size={14} />
					<span>Compilar</span>
				</button>
			{/if}
			<button class="action" onclick={copy} aria-label="Copiar código">
				<Icon name={copied ? 'check' : 'copy'} size={14} />
				<span>{copied ? 'Copiado' : 'Copiar'}</span>
			</button>
		</div>
	</div>

	<div class="scroll">
		<pre class="gutter" aria-hidden="true">{#each lines as _, i}<span
					class:hl={highlightLines.includes(i + 1)}>{i + 1}</span
				>{/each}</pre>
		<pre class="code"><code>{@html html}</code></pre>
	</div>

	{#if instructions && !isPython && !isShell}
		<div class="runner">
			<div class="runner-head">
				<span class="runner-title"><Icon name="terminal" size={15} /> Compilar y ejecutar en tu equipo</span>
				<button class="btn sm" onclick={copyCommand}>
					<Icon name={cmdCopied ? 'check' : 'copy'} size={12} />
					{cmdCopied ? 'Copiado' : 'Copiar comando'}
				</button>
			</div>
			<pre class="cmd">g++ -std=c++20 -O2 -Wall main.cpp -o main
./main</pre>
			<p class="hint">
				C++ no se ejecuta dentro del navegador. Guarda el ejemplo como <code>main.cpp</code> y ejecuta
				el comando en la terminal (requiere g++ o clang++ instalado).
			</p>
		</div>
	{/if}

	{#if open && runnable && isPython}
		<div class="runner">
			<div class="runner-head">
				<span class="runner-title"><Icon name="terminal" size={15} /> Editor — modifica y ejecuta</span>
				<button class="btn sm primary" onclick={execute} disabled={running}>
					<Icon name={running ? 'reset' : 'play'} size={13} />
					{running ? 'Ejecutando…' : 'Ejecutar'}
				</button>
			</div>
			<textarea
				bind:value={source}
				spellcheck="false"
				rows={Math.min(22, Math.max(4, source.split('\n').length + 1))}
				onkeydown={onKeydown}
				aria-label="Código Python editable"
			></textarea>
			{#if status}
				<div class="status">{status}</div>
			{/if}
			{#if output || error}
				<div class="console">
					<div class="console-head">
						<span>Salida</span>
						{#if ms}<span class="ms">{ms} ms</span>{/if}
					</div>
					{#if output}<pre class="out">{output}</pre>{/if}
					{#if error}<pre class="err">{error}</pre>{/if}
				</div>
			{/if}
			<p class="hint">
				Python real (Pyodide) en tu navegador. La primera ejecución descarga el intérprete; evita
				bucles infinitos.
			</p>
		</div>
	{/if}
</figure>

<style>
	.code-block {
		margin: 1.5rem 0 0;
		border: 1px solid var(--line);
		border-radius: 13px;
		background: var(--code-bg);
		overflow: hidden;
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03) inset;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 7px 10px 7px 13px;
		background: color-mix(in srgb, var(--code-bg) 70%, white 6%);
		border-bottom: 1px solid #1d2a42;
	}

	.left {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.lang {
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.09em;
		padding: 2px 7px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.07);
		color: #a9b8d4;
		flex: none;
	}
	.lang.py {
		color: #ffd166;
		background: rgba(255, 209, 102, 0.1);
	}
	.lang.cpp {
		color: #74b9ff;
		background: rgba(116, 185, 255, 0.1);
	}

	.caption {
		font-size: 12px;
		color: #8d9cb8;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.actions {
		display: flex;
		gap: 4px;
		flex: none;
	}

	.action {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 8px;
		border-radius: 6px;
		border: 0;
		background: transparent;
		color: #93a4c2;
		font-size: 11.5px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}
	.action:hover {
		background: rgba(255, 255, 255, 0.07);
		color: #e8eefc;
	}

	.scroll {
		display: flex;
		overflow-x: auto;
		font-size: 13.6px;
		line-height: 1.7;
	}

	.gutter {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 14px 10px 14px 14px;
		color: #465670;
		text-align: right;
		font-size: 12px;
		user-select: none;
		flex: none;
		background: rgba(255, 255, 255, 0.012);
		border-right: 1px solid rgba(255, 255, 255, 0.035);
	}
	.gutter span {
		height: 1.7em;
		line-height: 1.7em;
	}
	.gutter span.hl {
		color: #ffd166;
		font-weight: 700;
	}

	.code {
		margin: 0;
		padding: 14px 18px 14px 14px;
		min-width: max-content;
		color: #d7e1f5;
		tab-size: 4;
	}

	.code :global(.tk-com) {
		color: #5d7191;
		font-style: italic;
	}
	.code :global(.tk-str) {
		color: #9ae6b4;
	}
	.code :global(.tk-num) {
		color: #f6ad9b;
	}
	.code :global(.tk-kw) {
		color: #c3a6ff;
	}
	.code :global(.tk-bi) {
		color: #82c7ff;
	}
	.code :global(.tk-fn) {
		color: #ffd166;
	}

	.runner {
		border-top: 1px solid #1d2a42;
		padding: 12px 14px 13px;
		background: #080e1a;
	}

	.runner-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 8px;
	}

	.runner-title {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 650;
		color: #a9b8d4;
		letter-spacing: 0.01em;
	}

	textarea {
		display: block;
		width: 100%;
		resize: vertical;
		padding: 11px 12px;
		border-radius: 8px;
		border: 1px solid #22304a;
		background: #0c1424;
		color: #e4ecfb;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.65;
		tab-size: 4;
		outline: none;
	}
	textarea:focus {
		border-color: #3e5a8a;
		box-shadow: 0 0 0 3px rgba(116, 185, 255, 0.12);
	}

	.status {
		margin-top: 8px;
		font-size: 12px;
		color: #8fa8ff;
	}

	.console {
		margin-top: 10px;
		border: 1px solid #22304a;
		border-radius: 8px;
		overflow: hidden;
	}

	.console-head {
		display: flex;
		justify-content: space-between;
		padding: 5px 10px;
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
		color: #7b8db0;
		background: #101a2c;
	}
	.ms {
		color: #5d7191;
	}

	.out,
	.err {
		margin: 0;
		padding: 10px 12px;
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.6;
		white-space: pre-wrap;
		color: #d7e1f5;
		max-height: 260px;
		overflow: auto;
	}
	.err {
		color: #ffb3c0;
		background: rgba(251, 113, 133, 0.07);
		border-top: 1px solid rgba(251, 113, 133, 0.18);
	}

	.hint {
		margin: 8px 0 0;
		font-size: 11.5px;
		color: #6d7c96;
		line-height: 1.5;
	}

	.hint code {
		color: #a9b8d4;
	}

	.cmd {
		margin: 0;
		padding: 10px 12px;
		border-radius: 8px;
		border: 1px solid #22304a;
		background: #0c1424;
		color: #9ae6b4;
		font-family: var(--font-mono);
		font-size: 12.5px;
		line-height: 1.7;
		white-space: pre-wrap;
	}

	.compact {
		margin-top: 0.75rem;
	}

	@media (max-width: 640px) {
		.action span {
			display: none;
		}
		.scroll {
			font-size: 12.8px;
		}
	}
</style>
