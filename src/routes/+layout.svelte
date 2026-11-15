<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import TopBar from '$lib/components/TopBar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import { progress } from '$lib/progress.svelte';

	let { children } = $props();

	let mobileOpen = $state(false);
	let searchOpen = $state(false);

	onMount(() => progress.init());

	afterNavigate(() => {
		mobileOpen = false;
	});

	function onkeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			searchOpen = true;
		}
	}
</script>

<svelte:window onkeydown={onkeydown} />

<a class="skip" href="#contenido">Saltar al contenido</a>

<TopBar onSearch={() => (searchOpen = true)} onMenu={() => (mobileOpen = !mobileOpen)} />

<div class="frame">
	<Sidebar open={mobileOpen} onNavigate={() => (mobileOpen = false)} />
	{#if mobileOpen}
		<button class="scrim" onclick={() => (mobileOpen = false)} aria-label="Cerrar menú"></button>
	{/if}
	<main id="contenido">
		{@render children()}
	</main>
</div>

<SearchModal bind:open={searchOpen} />

<style>
	.frame {
		position: relative;
		z-index: 1;
	}

	main {
		margin-left: var(--sidebar);
		padding-top: var(--topbar);
		min-height: 100vh;
	}

	.skip {
		position: fixed;
		top: -60px;
		left: 12px;
		z-index: 100;
		background: var(--accent);
		color: #060b16;
		padding: 7px 12px;
		border-radius: 0 0 8px 8px;
		font-size: 12px;
		font-weight: 700;
	}
	.skip:focus {
		top: 0;
	}

	.scrim {
		position: fixed;
		inset: var(--topbar) 0 0 0;
		z-index: 39;
		border: 0;
		background: rgba(3, 7, 14, 0.55);
		backdrop-filter: blur(2px);
		cursor: pointer;
	}

	@media (max-width: 1080px) {
		main {
			margin-left: 0;
		}
	}
</style>
