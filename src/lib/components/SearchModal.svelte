<script lang="ts">
	import { search, suggestedQueries } from '$lib/search';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import Icon from './Icon.svelte';
	import SearchResultList from './SearchResultList.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let query = $state('');
	let input = $state<HTMLInputElement | null>(null);
	let active = $state(0);

	const hits = $derived(query.trim() ? search(query, { limit: 12 }) : []);

	$effect(() => {
		if (!open) return;
		active = 0;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		tick().then(() => input?.select());
		return () => {
			document.body.style.overflow = previous;
		};
	});

	$effect(() => {
		query;
		active = 0;
	});

	function close() {
		open = false;
	}

	function pick(index: number) {
		const hit = hits[index];
		if (!hit) return;
		open = false;
		goto(
			`/${hit.doc.track}/${hit.doc.id}/${hit.sectionId && hit.sectionId !== 'inicio' ? `#${hit.sectionId}` : ''}`
		);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'ArrowDown') {
			event.preventDefault();
			active = hits.length ? (active + 1) % hits.length : 0;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			active = hits.length ? (active - 1 + hits.length) % hits.length : 0;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			pick(active);
		}
	}

	function quick(term: string) {
		query = term;
		input?.focus();
	}
</script>

<svelte:window onkeydown={(event) => { if (open) onkeydown(event); }} />

{#if open}
	<div class="overlay" role="presentation" onclick={close}></div>
	<div class="modal" role="dialog" aria-modal="true" aria-label="Buscador de conceptos">
		<div class="input-row">
			<Icon name="search" size={18} />
			<input
				bind:this={input}
				bind:value={query}
				placeholder="¿Cómo funciona un if? ¿Punteros? ¿Slicing?"
				aria-label="Buscar concepto"
				autocomplete="off"
				spellcheck="false"
			/>
			<button class="esc" onclick={close} aria-label="Cerrar buscador">esc</button>
		</div>

		<div class="body">
			{#if !query.trim()}
				<div class="start">
					<p class="label">Prueba con</p>
					<div class="chips">
						{#each suggestedQueries as term}
							<button onclick={() => quick(term)}>{term}</button>
						{/each}
					</div>
					<div class="tips">
						<span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
						<span><kbd>↵</kbd> abrir</span>
						<span><kbd>esc</kbd> cerrar</span>
					</div>
				</div>
			{:else if hits.length === 0}
				<div class="empty">
					<Icon name="search" size={22} />
					<p>No encontré «{query}».</p>
					<span>Prueba con un término más corto: «bucle», «puntero», «clase»…</span>
				</div>
			{:else}
				<div class="summary">
					{ hits.length } {hits.length === 1 ? 'resultado' : 'resultados'} en Python y C++
				</div>
				<SearchResultList {hits} {query} compact {active} onNavigate={close} />
			{/if}
		</div>

		<div class="foot">
			<span><Icon name="keyboard" size={12} /> Búsqueda local, sin internet</span>
			<button onclick={() => { close(); goto('/buscar/'); }}>Ver todos los resultados →</button>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 90;
		background: rgba(4, 8, 16, 0.62);
		backdrop-filter: blur(3px);
		animation: fade 0.14s ease;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
	}

	.modal {
		position: fixed;
		z-index: 91;
		top: 8vh;
		left: 50%;
		transform: translateX(-50%);
		width: min(660px, calc(100vw - 28px));
		max-height: 78vh;
		display: flex;
		flex-direction: column;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 16px;
		box-shadow: 0 30px 90px -20px rgba(0, 0, 0, 0.7);
		overflow: hidden;
		animation: pop 0.16s var(--ease);
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-8px) scale(0.99);
		}
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border-bottom: 1px solid var(--line);
		color: var(--faint);
	}

	.input-row input {
		flex: 1;
		border: 0;
		background: transparent;
		outline: none;
		font-size: 15px;
		color: var(--text);
		min-width: 0;
	}
	.input-row input::placeholder {
		color: var(--faint);
	}

	.esc {
		border: 1px solid var(--line);
		border-radius: 5px;
		background: var(--panel-2);
		color: var(--faint);
		font-size: 10px;
		padding: 2px 6px;
		cursor: pointer;
		font-family: var(--font-mono);
	}
	.esc:hover {
		color: var(--text-2);
	}

	.body {
		padding: 9px;
		overflow-y: auto;
		min-height: 120px;
	}

	.start {
		padding: 8px 6px 10px;
	}

	.label {
		margin: 0 0 8px;
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--faint);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.chips button {
		padding: 5px 10px;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--panel-2);
		color: var(--text-2);
		font-size: 12px;
		cursor: pointer;
	}
	.chips button:hover {
		border-color: var(--accent);
		color: var(--text);
		background: var(--accent-soft);
	}

	.tips {
		display: flex;
		gap: 14px;
		margin-top: 18px;
		font-size: 10.5px;
		color: var(--faint);
	}
	.tips span {
		display: inline-flex;
		align-items: center;
		gap: 3px;
	}
	kbd {
		font-family: var(--font-mono);
		font-size: 9.5px;
		padding: 1px 4px;
		border: 1px solid var(--line);
		border-radius: 3px;
		background: var(--panel-2);
	}

	.summary {
		padding: 4px 8px 6px;
		font-size: 10.5px;
		color: var(--faint);
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
		padding: 28px 12px;
		text-align: center;
		color: var(--faint);
	}
	.empty p {
		margin: 3px 0 0;
		color: var(--text-2);
		font-size: 14px;
		font-weight: 600;
	}
	.empty span {
		font-size: 12px;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 8px 14px;
		border-top: 1px solid var(--line);
		background: var(--panel-2);
		font-size: 10.5px;
		color: var(--faint);
	}
	.foot span {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.foot button {
		border: 0;
		background: transparent;
		color: var(--accent);
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		padding: 0;
	}

	@media (max-width: 620px) {
		.modal {
			top: 0;
			max-height: 100vh;
			height: 100dvh;
			width: 100vw;
			border-radius: 0;
			border: 0;
		}
		.tips {
			flex-wrap: wrap;
		}
	}
</style>
