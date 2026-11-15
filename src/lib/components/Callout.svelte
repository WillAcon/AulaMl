<script lang="ts">
	import Icon from './Icon.svelte';
	import { inline } from '$lib/md';
	import type { Tone } from '$lib/types';

	let {
		tone = 'info',
		title,
		md
	}: { tone?: Tone; title?: string; md: string } = $props();

	const config: Record<Tone, { icon: string; label: string }> = {
		info: { icon: 'info', label: 'Nota' },
		tip: { icon: 'bulb', label: 'Consejo' },
		warn: { icon: 'alert', label: 'Cuidado' },
		danger: { icon: 'alert', label: 'Error frecuente' },
		success: { icon: 'check', label: 'Buena práctica' }
	};

	const current = $derived(config[tone] ?? config.info);
</script>

<aside class="callout {tone}">
	<div class="title">
		<Icon name={current.icon} size={15} />
		<span>{title ?? current.label}</span>
	</div>
	<div class="body">{@html inline(md)}</div>
</aside>

<style>
	.callout {
		margin: 1.4rem 0 0;
		padding: 11px 14px 12px;
		border-radius: 0 10px 10px 0;
		border-left: 3px solid;
		font-size: 14.5px;
		line-height: 1.65;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		font-weight: 750;
		margin-bottom: 4px;
	}

	.body {
		color: var(--text-2);
	}

	.info {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.info .title {
		color: var(--accent);
	}

	.tip {
		border-color: var(--ok);
		background: var(--ok-soft);
	}
	.tip .title {
		color: var(--ok);
	}

	.success {
		border-color: var(--ok);
		background: var(--ok-soft);
	}
	.success .title {
		color: var(--ok);
	}

	.warn {
		border-color: var(--warn);
		background: var(--warn-soft);
	}
	.warn .title {
		color: var(--warn);
	}

	.danger {
		border-color: var(--danger);
		background: var(--danger-soft);
	}
	.danger .title {
		color: var(--danger);
	}
</style>
