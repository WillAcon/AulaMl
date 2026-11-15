<script module lang="ts">
	import { allLessons } from '$lib/data';
	const allIds = allLessons.map((lesson) => lesson.id);
</script>

<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { progress } from '$lib/progress.svelte';
	import { stats } from '$lib/data';
	import { trackEvent } from '$lib/analytics';

	let { onSearch, onMenu }: { onSearch: () => void; onMenu: () => void } = $props();

	const isHome = $derived(page.url.pathname === '/');
</script>

<header class="topbar">
	<button class="icon-btn menu" onclick={onMenu} aria-label="Abrir menú de lecciones">
		<Icon name="menu" size={19} />
	</button>

	<a class="brand" href="/" aria-label="AulaML, inicio">
		<span class="mark" aria-hidden="true">
			<svg viewBox="0 0 64 64" width="27" height="27">
				<rect width="64" height="64" rx="15" fill="none" />
				<path d="M23 17 12 32l11 15" fill="none" stroke="var(--py)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M41 17l11 15-11 15" fill="none" stroke="var(--cpp)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</span>
		<span class="name">Aula<span>ML</span></span>
		<span class="sub">Python · C++</span>
	</a>

	<button class="search" onclick={onSearch} aria-label="Buscar en todas las lecciones">
		<Icon name="search" size={16} />
		<span class="placeholder">Buscar un concepto, función o error…</span>
		<kbd>⌘K</kbd>
	</button>

	<div class="right">
		<a class="link" href="/practica/" class:active={page.url.pathname.startsWith('/practica')}>
			<Icon name="pencil" size={15} />
			<span>Práctica</span>
		</a>

		<div class="pct" title={`${stats.lessons} lecciones en total`}>
			<svg viewBox="0 0 36 36" width="26" height="26" aria-hidden="true">
				<circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" stroke-width="3.5" />
				<circle
					cx="18"
					cy="18"
					r="15"
					fill="none"
					stroke="var(--accent)"
					stroke-width="3.5"
					stroke-linecap="round"
					stroke-dasharray={`${(progress.percent(allIds) / 100) * 94.2} 94.2`}
					transform="rotate(-90 18 18)"
				/>
			</svg>
			<span>{progress.percent(allIds)}%</span>
		</div>

		<button
			class="icon-btn"
			onclick={() => {
				progress.toggleTheme();
				trackEvent('theme_change', { theme: progress.state.theme });
			}}
			aria-label="Cambiar tema claro u oscuro"
		>
			<Icon name={progress.state.theme === 'dark' ? 'sun' : 'moon'} size={17} />
		</button>
	</div>
</header>

<style>
	.topbar {
		position: fixed;
		inset: 0 0 auto;
		height: var(--topbar);
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 0 18px;
		background: color-mix(in srgb, var(--bg) 82%, transparent);
		backdrop-filter: blur(14px) saturate(1.2);
		-webkit-backdrop-filter: blur(14px) saturate(1.2);
		border-bottom: 1px solid var(--line);
	}

	.menu {
		display: none;
	}

	.brand {
		display: flex;
		align-items: baseline;
		gap: 7px;
		color: var(--text);
		flex: none;
		text-decoration: none;
	}
	.brand:hover {
		text-decoration: none;
	}

	.mark {
		display: inline-flex;
		align-self: center;
	}

	.name {
		font-size: 17px;
		font-weight: 750;
		letter-spacing: -0.03em;
	}
	.name span {
		color: var(--accent);
	}

	.sub {
		font-size: 10.5px;
		color: var(--faint);
		letter-spacing: 0.04em;
		padding-left: 8px;
		border-left: 1px solid var(--line);
	}

	.search {
		flex: 1;
		max-width: 520px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 8px;
		height: 36px;
		padding: 0 9px 0 12px;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		color: var(--muted);
		cursor: pointer;
		font-size: 13px;
		text-align: left;
		transition:
			border-color 0.15s,
			background 0.15s;
	}
	.search:hover {
		border-color: color-mix(in srgb, var(--accent) 40%, var(--line));
		background: var(--panel-3);
	}
	.placeholder {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	kbd {
		font-size: 10px;
		padding: 2px 5px;
		border-radius: 4px;
		border: 1px solid var(--line);
		background: var(--panel);
		color: var(--faint);
		font-family: var(--font-sans);
		white-space: nowrap;
	}

	.right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
	}

	.link {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 9px;
		border-radius: 7px;
		font-size: 12.5px;
		font-weight: 550;
		color: var(--muted);
		text-decoration: none;
	}
	.link:hover,
	.link.active {
		background: var(--panel-3);
		color: var(--text);
		text-decoration: none;
	}

	.pct {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 650;
		color: var(--muted);
		font-variant-numeric: tabular-nums;
	}
	.pct svg {
		color: var(--accent);
	}

	.icon-btn {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 8px;
		border: 1px solid transparent;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		transition: background 0.15s;
	}
	.icon-btn:hover {
		background: var(--panel-3);
		color: var(--text);
	}

	@media (max-width: 1080px) {
		.menu {
			display: grid;
		}
		.sub {
			display: none;
		}
		.search {
			max-width: none;
		}
	}

	@media (max-width: 820px) {
		.search .placeholder {
			display: none;
		}
		.search {
			flex: none;
			margin-left: auto;
			width: 38px;
			justify-content: center;
			padding: 0;
		}
		.search kbd {
			display: none;
		}
		.link span {
			display: none;
		}
		.pct {
			display: none;
		}
		.topbar {
			gap: 8px;
			padding: 0 12px;
		}
	}

	@media (max-width: 520px) {
		.name {
			font-size: 15.5px;
		}
		.link {
			display: none;
		}
	}
</style>
