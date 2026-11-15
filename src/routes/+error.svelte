<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
</script>

<div class="error">
	<span class="code">404</span>
	<h1>Esta página no existe (o aún no la escribimos).</h1>
	<p>Puedes volver al inicio o buscar el concepto que necesitas en las lecciones.</p>
	<div class="actions">
		<a class="btn primary" href="/"><Icon name="home" size={15} /> Volver al inicio</a>
		<a class="btn" href="/buscar/"><Icon name="search" size={15} /> Buscar un concepto</a>
	</div>
</div>

<style>
	.error {
		max-width: 620px;
		margin: 0 auto;
		padding: 90px 24px;
		text-align: center;
	}
	.code {
		font-family: var(--font-mono);
		font-size: 13px;
		letter-spacing: 0.2em;
		color: var(--accent);
	}
	h1 {
		margin: 10px 0 10px;
		font-size: clamp(1.5rem, 4vw, 2.2rem);
	}
	p {
		color: var(--muted);
		font-size: 15px;
	}
	.actions {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-top: 22px;
		flex-wrap: wrap;
	}
</style>
