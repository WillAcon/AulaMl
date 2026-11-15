<script lang="ts">
	import Icon from './Icon.svelte';
	import { highlight } from '$lib/highlight';
	import { inline } from '$lib/md';
	import { trackEvent } from '$lib/analytics';

	let {
		code,
		answers,
		lang = 'python',
		title,
		hint,
		explain,
		lessonId
	}: {
		code: string;
		answers: string[];
		lang?: string;
		title?: string;
		hint?: string;
		explain?: string;
		lessonId: string;
	} = $props();

	const parts = $derived(code.split('___'));
	let values = $state<string[]>(answers.map(() => ''));
	let status = $state<(boolean | null)[]>(answers.map(() => null));
	let revealed = $state(false);

	const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
	const allDone = $derived(status.every((item) => item === true));

	function check() {
		const next = answers.map((answer, i) =>
			answer
				.split('|')
				.map(normalize)
				.includes(normalize(values[i] ?? ''))
		);
		status = next;
		if (next.every(Boolean)) {
			trackEvent('fill_complete', {
				lesson_id: lessonId,
				exercise: title ?? 'completar código'
			});
		}
	}

	function reset() {
		values = answers.map(() => '');
		status = answers.map(() => null);
		revealed = false;
	}

	function reveal() {
		values = answers.map((answer) => answer.split('|')[0]);
		status = answers.map(() => true);
		revealed = true;
	}
</script>

<div class="fill">
	<div class="head">
		<span class="badge"><Icon name="pencil" size={12} /> Completar código</span>
		{#if title}<span class="title">{title}</span>{/if}
	</div>

	<pre class="code">{#each parts as part, i}{@html highlight(part, lang)}{#if i < answers.length}<input
					bind:value={values[i]}
					class:ok={status[i] === true}
					class:ko={status[i] === false}
					size={Math.max(4, answers[i].split('|')[0].length + 1)}
					spellcheck="false"
					aria-label={`Espacio ${i + 1}`}
					onkeydown={(event) => event.key === 'Enter' && check()}
				/>{/if}{/each}</pre>

	{#if hint}
		<p class="hint"><Icon name="bulb" size={12} /> {hint}</p>
	{/if}

	<div class="actions">
		<button class="btn sm primary" onclick={check}><Icon name="check" size={12} /> Comprobar</button>
		<button class="btn sm ghost" onclick={reveal}><Icon name="bulb" size={12} /> Ver solución</button>
		{#if values.some(Boolean)}<button class="btn sm ghost" onclick={reset}><Icon name="reset" size={12} /> Limpiar</button>{/if}
		{#if allDone}<span class="success"><Icon name="check" size={12} /> ¡Correcto!</span>{/if}
	</div>

	{#if revealed}
		<div class="solution">
			<strong>Respuestas:</strong>
			{#each answers as answer, i}<code>{answer.split('|')[0]}</code>{#if i < answers.length - 1} · {/if}{/each}
		</div>
	{/if}

	{#if explain && (allDone || revealed)}
		<div class="explain">{@html inline(explain)}</div>
	{/if}
</div>

<style>
	.fill {
		margin: 1.5rem 0 0;
		border: 1px solid var(--line);
		border-radius: 13px;
		background: var(--panel);
		overflow: hidden;
	}

	.head {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 8px 13px;
		border-bottom: 1px solid var(--line-soft);
		background: var(--panel-2);
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 9.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--accent);
	}

	.title {
		font-size: 12px;
		color: var(--muted);
		border-left: 1px solid var(--line);
		padding-left: 9px;
	}

	.code {
		margin: 0;
		padding: 13px 15px;
		background: var(--code-bg);
		color: #c9d6ee;
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 2.1;
		overflow-x: auto;
		white-space: pre-wrap;
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

	input {
		display: inline-block;
		padding: 2px 6px;
		margin: 0 2px;
		border: 1px dashed #3c4d6e;
		border-radius: 5px;
		background: #111c30;
		color: #ffd166;
		font-family: var(--font-mono);
		font-size: 12.5px;
		text-align: center;
		outline: none;
		vertical-align: baseline;
	}
	input:focus {
		border-color: #ffd166;
		border-style: solid;
	}
	input.ok {
		border-color: var(--ok);
		border-style: solid;
		color: var(--ok);
	}
	input.ko {
		border-color: var(--danger);
		border-style: solid;
		color: #ffb3c0;
	}

	.hint {
		display: flex;
		align-items: flex-start;
		gap: 5px;
		margin: 0;
		padding: 7px 14px 0;
		font-size: 11.5px;
		color: var(--faint);
	}

	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 7px;
		padding: 11px 14px 12px;
	}

	.success {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		font-weight: 650;
		color: var(--ok);
	}

	.solution {
		padding: 8px 14px;
		border-top: 1px solid var(--line-soft);
		background: var(--panel-2);
		font-size: 12px;
		color: var(--muted);
	}
	.solution code {
		color: var(--text);
		background: var(--panel-3);
		padding: 1px 5px;
		border-radius: 4px;
		font-size: 11.5px;
	}

	.explain {
		padding: 9px 14px 11px;
		border-top: 1px dashed var(--line-soft);
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--text-2);
	}
</style>
