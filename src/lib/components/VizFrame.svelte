<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		title,
		kind = 'Visualización interactiva',
		icon = 'spark',
		hint,
		toolbar,
		children
	}: {
		title?: string;
		kind?: string;
		icon?: string;
		hint?: string;
		toolbar?: Snippet;
		children: Snippet;
	} = $props();
</script>

<section class="viz">
	<header>
		<div class="label">
			<span class="ico"><Icon name={icon} size={14} /></span>
			<span class="kind">{kind}</span>
			{#if title}<span class="sep">·</span><span class="title">{title}</span>{/if}
		</div>
		{#if toolbar}<div class="toolbar">{@render toolbar()}</div>{/if}
	</header>
	<div class="body">
		{@render children()}
	</div>
	{#if hint}
		<p class="hint"><Icon name="bulb" size={13} /> {hint}</p>
	{/if}
</section>

<style>
	.viz {
		margin: 1.6rem 0 0;
		border: 1px solid var(--line);
		border-radius: 15px;
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--panel) 88%, transparent), var(--panel));
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
		padding: 9px 14px;
		border-bottom: 1px solid var(--line-soft);
		background: color-mix(in srgb, var(--panel-2) 72%, transparent);
	}

	.label {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		font-size: 11.5px;
	}

	.ico {
		display: inline-flex;
		color: var(--accent);
	}

	.kind {
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-weight: 700;
		font-size: 10.5px;
		color: var(--muted);
	}

	.sep {
		color: var(--faint);
	}

	.title {
		color: var(--text);
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.body {
		padding: 14px;
	}

	.hint {
		display: flex;
		align-items: flex-start;
		gap: 6px;
		margin: 0;
		padding: 8px 14px 10px;
		border-top: 1px dashed var(--line-soft);
		color: var(--faint);
		font-size: 12px;
		line-height: 1.5;
	}

	@media (max-width: 560px) {
		.body {
			padding: 11px;
		}
		.title {
			white-space: normal;
		}
	}
</style>
