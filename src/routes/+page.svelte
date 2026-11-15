<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { tracks, stats, lessonById, moduleTitleByLesson, getNeighbors } from '$lib/data';
	import { progress } from '$lib/progress.svelte';

	let q = $state('');

	const totalIds = $derived(tracks.flatMap((track) => track.flatLessons.map((lesson) => lesson.id)));
	const totalPct = $derived(progress.percent(totalIds));
	const lastLesson = $derived(progress.state.last ? lessonById.get(progress.state.last) : undefined);
	const favorites = $derived(progress.state.fav.map((id) => lessonById.get(id)).filter(Boolean));
	const hours = Math.round(stats.minutes / 60);
	const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

	function submit(event: SubmitEvent) {
		event.preventDefault();
		goto(`/buscar/${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
	}

	const prompts = ['if / else', 'slicing', 'punteros', 'lambda', 'decoradores', 'DataFrame'];

	const steps = [
		{
			icon: 'book',
			title: 'Entiende',
			text: 'Cada concepto empieza con una explicación sin tecnicismos: qué es, para qué sirve y cómo funciona por dentro.'
		},
		{
			icon: 'spark',
			title: 'Visualiza',
			text: 'Ejecuta el código paso a paso y observa variables, memoria, índices y matrices mientras cambian.'
		},
		{
			icon: 'pencil',
			title: 'Practica',
			text: 'Completa código, resuelve ejercicios y comprueba tu respuesta con la solución explicada.'
		},
		{
			icon: 'target',
			title: 'Comprueba',
			text: 'Cierra cada lección con preguntas de evaluación y guarda tu progreso en el navegador.'
		}
	];

	const visualizers = [
		{ icon: 'play', title: 'Traza paso a paso', text: 'Línea activa, variables, pila de llamadas y salida.' },
		{ icon: 'grid', title: 'Slicing interactivo', text: 'Índices, inicio, fin, salto y resultado en vivo.' },
		{ icon: 'layers', title: 'Mapa de memoria', text: 'Stack, heap, direcciones y punteros en C++.' },
		{ icon: 'grid', title: 'Matrices y tensores', text: 'Celdas, formas y operaciones con NumPy.' }
	];
</script>

<svelte:head>
	<title>AulaML · Aprende Python y C++ para Machine Learning</title>
</svelte:head>

<div class="home">
	<!-- HERO -->
	<section class="hero">
		<div class="badge"><Icon name="spark" size={13} /> Curso interactivo · de cero a producción</div>
		<h1>
			Aprende <span class="py">Python</span> y <span class="cpp">C++</span><br />
			para construir <em>Machine Learning</em>.
		</h1>
		<p class="lead">
			{plural(stats.lessons, 'lección', 'lecciones')} que explican cada concepto como un profesor
			particular: sintaxis, cómo funciona por dentro, visualizaciones interactivas, ejercicios y
			proyectos reales. Sin instalar nada para empezar.
		</p>

		<form class="searchbox" onsubmit={submit} role="search">
			<Icon name="search" size={19} />
			<input
				bind:value={q}
				placeholder="¿Qué quieres entender hoy?"
				aria-label="Buscar un concepto"
			/>
			<button type="submit" class="btn primary">Buscar</button>
		</form>

		<div class="prompts">
			<span>Prueba:</span>
			{#each prompts as prompt}
				<a href="/buscar/?q={encodeURIComponent(prompt)}">{prompt}</a>
			{/each}
		</div>

		<div class="stats">
			<div><strong>{stats.lessons}</strong><span>lecciones</span></div>
			<div><strong>{stats.modules}</strong><span>módulos</span></div>
			<div><strong>{stats.quizzes}</strong><span>evaluaciones</span></div>
			<div><strong>{hours} h</strong><span>de estudio</span></div>
		</div>
	</section>

	<!-- CONTINUAR -->
	{#if lastLesson}
		{@const neighbors = getNeighbors(lastLesson)}
		<section class="continue">
			<div class="cont-left">
				<span class="cont-label"><Icon name="clock" size={12} /> Continúa donde lo dejaste</span>
				<a class="cont-title" href="/{lastLesson.track}/{lastLesson.id}/">{lastLesson.title}</a>
				<span class="cont-meta">
					{lastLesson.track === 'python' ? 'Python' : 'C++'} · {neighbors.module ?? ''} · {lastLesson.minutes} min
				</span>
			</div>
			<div class="cont-right">
				<div class="mini-ring" style="--p:{totalPct}%"><span>{totalPct}%</span></div>
				<a class="btn primary" href="/{lastLesson.track}/{lastLesson.id}/">
					Seguir <Icon name="arrowRight" size={14} />
				</a>
			</div>
		</section>
	{/if}

	<!-- CURSOS -->
	<section class="tracks">
		{#each tracks as track}
			{@const ids = track.flatLessons.map((lesson) => lesson.id)}
			{@const pct = progress.percent(ids)}
			{@const minutes = track.flatLessons.reduce((sum, lesson) => sum + lesson.minutes, 0)}
			<article class="track-card {track.id}">
				<div class="tc-top">
					<span class="tc-dot"></span>
					<span class="tc-label">{track.id === 'python' ? 'CURSO 01' : 'CURSO 02'}</span>
					<div class="tc-ring" style="--p:{pct}%"><span>{pct}%</span></div>
				</div>
				<h2>{track.name}</h2>
				<p class="tc-tag">{track.tagline}</p>
				<p class="tc-desc">{track.description}</p>

				<div class="tc-meta">
					<span><Icon name="book" size={13} /> {plural(track.flatLessons.length, 'lección', 'lecciones')}</span>
					<span><Icon name="layers" size={13} /> {track.modules.length} módulos</span>
					<span><Icon name="clock" size={13} /> {Math.round(minutes / 60)} h</span>
				</div>

				<div class="tc-bar"><i style="width:{pct}%"></i></div>

				<ul class="tc-mods">
					{#each track.modules.slice(0, 5) as mod, i}
						<li>
							<span class="n">{String(i + 1).padStart(2, '0')}</span>
							<span>{mod.title}</span>
							<span class="c">{mod.lessonsData.length}</span>
						</li>
					{/each}
					{#if track.modules.length > 5}
						<li class="more">+ {track.modules.length - 5} módulos más</li>
					{/if}
				</ul>

				<div class="tc-actions">
					<a class="btn primary" href="/{track.id}/">
						{progress.doneCount(ids) > 0 ? 'Continuar curso' : 'Empezar curso'}
						<Icon name="arrowRight" size={14} />
					</a>
					<a class="tc-first" href="/{track.id}/">Ver programa completo</a>
				</div>
			</article>
		{/each}
	</section>

	<!-- FAVORITOS -->
	{#if favorites.length}
		<section class="favorites">
			<h2><Icon name="star" size={15} /> Para repasar</h2>
			<div class="fav-list">
				{#each favorites as lesson}
					<a href="/{lesson?.track}/{lesson?.id}/">
						<span class="fchip {lesson?.track}">{lesson?.track === 'python' ? 'PY' : 'C++'}</span>
						{lesson?.title}
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- RUTA -->
	<section class="roadmap">
		<header class="sec-head">
			<span class="kicker">El camino completo</span>
			<h2>Dos lenguajes, una misma meta: entender la IA</h2>
			<p>
				Los cursos avanzan en paralelo. Empieza por Python si vienes de cero; usa C++ cuando
				quieras entender la memoria y el rendimiento de verdad.
			</p>
		</header>

		<div class="road-cols">
			{#each tracks as track}
				<div class="road-col">
					<h3 class="{track.id}"><span></span>{track.name} · {plural(track.flatLessons.length, 'lección', 'lecciones')}</h3>
					{#each track.modules as mod, i}
						{@const modIds = mod.lessonsData.map((lesson) => lesson.id)}
						{@const modPct = progress.percent(modIds)}
						<a class="road-row" href="/{track.id}/">
							<span class="rnum">{String(i + 1).padStart(2, '0')}</span>
							<span class="rbody">
								<span class="rtitle">{mod.title}</span>
								<span class="rsub">{plural(mod.lessonsData.length, 'lección', 'lecciones')}</span>
							</span>
							<span class="rprog">{modPct > 0 ? `${modPct}%` : ''}</span>
							<Icon name="chevron" size={12} />
						</a>
					{/each}
				</div>
			{/each}
		</div>
	</section>

	<!-- METODOLOGÍA -->
	<section class="method" id="metodologia">
		<header class="sec-head">
			<span class="kicker">Cómo se estudia aquí</span>
			<h2>El mismo ciclo que usa un buen profesor</h2>
			<p>
				Cada lección sigue una estructura de 14 pasos: concepto, fundamento, sintaxis, ejemplos
				progresivos, visualización, errores comunes, buenas prácticas, ejercicios, soluciones,
				resumen y evaluación.
			</p>
		</header>

		<div class="step-grid">
			{#each steps as step, i}
				<div class="step">
					<span class="snum">{String(i + 1).padStart(2, '0')}</span>
					<span class="sicon"><Icon name={step.icon} size={18} /></span>
					<h3>{step.title}</h3>
					<p>{step.text}</p>
				</div>
			{/each}
		</div>

		<div class="viz-showcase">
			{#each visualizers as viz}
				<div class="viz-card">
					<span class="vicon"><Icon name={viz.icon} size={17} /></span>
					<strong>{viz.title}</strong>
					<span>{viz.text}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- CIERRE -->
	<section class="closing">
		<div>
			<h2>Tu progreso se queda contigo.</h2>
			<p>
				Las lecciones completadas, tus notas, favoritos y respuestas se guardan en el navegador.
				Sin cuentas, sin servidores y sin perder el hilo.
			</p>
		</div>
		<div class="close-actions">
			<a class="btn primary" href="/{tracks[0]?.id}/">Empezar por Python <Icon name="arrowRight" size={14} /></a>
			<a class="btn" href="/{tracks[1]?.id}/">Explorar C++</a>
		</div>
	</section>

	<footer>
		<span>AulaML · Python & C++ para Machine Learning</span>
		<span class="fdot">·</span>
		<span>{stats.lessons} lecciones · progreso local · sin distracciones</span>
	</footer>
</div>

<style>
	.home {
		max-width: 1120px;
		margin: 0 auto;
		padding: 34px 30px 40px;
	}

	/* HERO */
	.hero {
		padding: 26px 0 36px;
		max-width: 820px;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--line));
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 11px;
		font-weight: 650;
		letter-spacing: 0.03em;
	}

	h1 {
		margin: 16px 0 0;
		font-size: clamp(2.1rem, 5.2vw, 3.5rem);
		line-height: 1.06;
		letter-spacing: -0.035em;
		font-weight: 700;
	}
	h1 .py {
		color: var(--py);
	}
	h1 .cpp {
		color: var(--cpp);
	}
	h1 em {
		font-style: normal;
		background: linear-gradient(92deg, var(--accent), var(--accent-2));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.lead {
		margin: 16px 0 0;
		max-width: 640px;
		font-size: 16px;
		line-height: 1.65;
		color: var(--muted);
	}

	.searchbox {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 24px;
		padding: 7px 7px 7px 15px;
		border-radius: 13px;
		border: 1px solid var(--line);
		background: var(--panel);
		box-shadow: var(--shadow);
		color: var(--faint);
		max-width: 640px;
	}
	.searchbox:focus-within {
		border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
	}
	.searchbox input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: none;
		background: transparent;
		font-size: 14px;
		padding: 7px 0;
		color: var(--text);
	}
	.searchbox input::placeholder {
		color: var(--faint);
	}
	.searchbox .btn {
		border-radius: 9px;
		padding: 8px 15px;
	}

	.prompts {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 7px;
		margin-top: 10px;
		font-size: 11px;
		color: var(--faint);
	}
	.prompts a {
		padding: 2px 8px;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--muted);
		font-size: 11px;
	}
	.prompts a:hover {
		border-color: var(--accent);
		color: var(--accent);
		text-decoration: none;
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 26px;
		margin-top: 30px;
		padding-top: 20px;
		border-top: 1px solid var(--line);
	}
	.stats div {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}
	.stats strong {
		font-size: 20px;
		letter-spacing: -0.02em;
	}
	.stats span {
		font-size: 11.5px;
		color: var(--faint);
	}

	/* CONTINUAR */
	.continue {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		flex-wrap: wrap;
		padding: 16px 18px;
		margin-bottom: 22px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: linear-gradient(100deg, var(--panel-2), var(--panel));
	}
	.cont-left {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.cont-label {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
		color: var(--accent);
	}
	.cont-title {
		font-size: 17px;
		font-weight: 650;
		color: var(--text);
	}
	.cont-meta {
		font-size: 11.5px;
		color: var(--faint);
	}
	.cont-right {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.mini-ring {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		background: conic-gradient(var(--accent) var(--p), var(--line) 0);
		display: grid;
		place-items: center;
	}
	.mini-ring span {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--panel);
		display: grid;
		place-items: center;
		font-size: 9.5px;
		font-family: var(--font-mono);
		color: var(--muted);
	}

	/* CURSOS */
	.tracks {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
		margin-top: 8px;
	}

	.track-card {
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--panel);
		padding: 22px;
		position: relative;
		overflow: hidden;
	}
	.track-card::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 3px;
		background: var(--py);
	}
	.track-card.cpp::before {
		background: var(--cpp);
	}
	.track-card::after {
		content: '';
		position: absolute;
		right: -60px;
		top: -70px;
		width: 190px;
		height: 190px;
		border-radius: 50%;
		background: var(--py-soft);
		filter: blur(30px);
		pointer-events: none;
	}
	.track-card.cpp::after {
		background: var(--cpp-soft);
	}

	.tc-top {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.tc-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--py);
	}
	.cpp .tc-dot {
		background: var(--cpp);
	}
	.tc-label {
		font-size: 9.5px;
		font-weight: 750;
		letter-spacing: 0.1em;
		color: var(--faint);
	}
	.tc-ring {
		margin-left: auto;
		width: 46px;
		height: 46px;
		border-radius: 50%;
		background: conic-gradient(var(--py) var(--p), var(--line) 0);
		display: grid;
		place-items: center;
	}
	.cpp .tc-ring {
		background: conic-gradient(var(--cpp) var(--p), var(--line) 0);
	}
	.tc-ring span {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--panel);
		display: grid;
		place-items: center;
		font-size: 9.5px;
		font-family: var(--font-mono);
		color: var(--muted);
	}

	.track-card h2 {
		margin: 12px 0 1px;
		font-size: 27px;
		letter-spacing: -0.03em;
	}
	.tc-tag {
		margin: 0;
		font-size: 13px;
		font-weight: 550;
		color: var(--py);
	}
	.cpp .tc-tag {
		color: var(--cpp);
	}
	.tc-desc {
		margin: 9px 0 0;
		font-size: 13px;
		line-height: 1.6;
		color: var(--muted);
	}

	.tc-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 13px;
		font-size: 11px;
		color: var(--faint);
	}
	.tc-meta span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.tc-bar {
		height: 4px;
		border-radius: 3px;
		background: var(--line);
		margin-top: 13px;
		overflow: hidden;
	}
	.tc-bar i {
		display: block;
		height: 100%;
		background: var(--py);
		border-radius: 3px;
	}
	.cpp .tc-bar i {
		background: var(--cpp);
	}

	.tc-mods {
		list-style: none;
		margin: 15px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.tc-mods li {
		display: flex;
		align-items: baseline;
		gap: 8px;
		font-size: 12px;
		color: var(--text-2);
		padding: 3px 0;
		margin: 0;
	}
	.tc-mods .n {
		font-family: var(--font-mono);
		font-size: 9.5px;
		color: var(--faint);
	}
	.tc-mods .c {
		margin-left: auto;
		font-size: 9.5px;
		font-family: var(--font-mono);
		color: var(--faint);
	}
	.tc-mods .more {
		font-size: 10.5px;
		color: var(--faint);
		padding-left: 22px;
	}

	.tc-actions {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 18px;
		flex-wrap: wrap;
	}
	.tc-first {
		font-size: 11.5px;
		color: var(--muted);
	}
	.tc-first:hover {
		color: var(--text);
	}

	/* FAVORITOS */
	.favorites {
		margin-top: 26px;
	}
	.favorites h2 {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		color: var(--text-2);
		margin-bottom: 9px;
	}
	.fav-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.fav-list a {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 6px 11px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--panel);
		font-size: 12px;
		color: var(--text-2);
	}
	.fav-list a:hover {
		border-color: var(--accent);
		text-decoration: none;
	}
	.fchip {
		font-size: 8.5px;
		font-weight: 750;
		padding: 1px 4px;
		border-radius: 3px;
		letter-spacing: 0.05em;
	}
	.fchip.python {
		color: var(--py);
		background: var(--py-soft);
	}
	.fchip.cpp {
		color: var(--cpp);
		background: var(--cpp-soft);
	}

	/* SECCIONES */
	.roadmap,
	.method {
		margin-top: 52px;
	}

	.sec-head {
		max-width: 660px;
		margin-bottom: 20px;
	}
	.kicker {
		font-size: 10px;
		font-weight: 750;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.sec-head h2 {
		margin: 6px 0 8px;
		font-size: clamp(1.4rem, 2.6vw, 1.9rem);
		letter-spacing: -0.028em;
	}
	.sec-head p {
		margin: 0;
		font-size: 14px;
		line-height: 1.65;
		color: var(--muted);
	}

	.road-cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 22px;
	}
	.road-col h3 {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		font-weight: 750;
		color: var(--muted);
		margin-bottom: 8px;
	}
	.road-col h3 span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--py);
	}
	.road-col h3.cpp span {
		background: var(--cpp);
	}

	.road-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: 8px;
		border: 1px solid transparent;
		color: var(--text);
	}
	.road-row:hover {
		background: var(--panel-2);
		border-color: var(--line);
		text-decoration: none;
	}
	.rnum {
		font-family: var(--font-mono);
		font-size: 9.5px;
		color: var(--faint);
		width: 18px;
		flex: none;
	}
	.rbody {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
		min-width: 0;
	}
	.rtitle {
		font-size: 13px;
		font-weight: 550;
	}
	.rsub {
		font-size: 10px;
		color: var(--faint);
	}
	.rprog {
		font-family: var(--font-mono);
		font-size: 9.5px;
		color: var(--ok);
	}
	.road-row :global(svg) {
		color: var(--faint);
	}

	/* MÉTODO */
	.step-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
	}
	.step {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--panel);
		padding: 16px;
		position: relative;
	}
	.snum {
		position: absolute;
		top: 12px;
		right: 14px;
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--faint);
	}
	.sicon {
		display: inline-flex;
		padding: 7px;
		border-radius: 9px;
		background: var(--accent-soft);
		color: var(--accent);
	}
	.step h3 {
		margin: 10px 0 4px;
		font-size: 15px;
	}
	.step p {
		margin: 0;
		font-size: 12px;
		line-height: 1.6;
		color: var(--muted);
	}

	.viz-showcase {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
		margin-top: 12px;
	}
	.viz-card {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 12px 14px;
		border: 1px dashed var(--line);
		border-radius: var(--radius);
		background: var(--bg-2);
	}
	.vicon {
		color: var(--accent);
		margin-bottom: 3px;
	}
	.viz-card strong {
		font-size: 12.5px;
		color: var(--text-2);
	}
	.viz-card span:last-child {
		font-size: 11px;
		line-height: 1.5;
		color: var(--faint);
	}

	/* CIERRE */
	.closing {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		flex-wrap: wrap;
		margin-top: 52px;
		padding: 24px 26px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--line);
		background:
			radial-gradient(600px 200px at 15% 0%, var(--glow-a), transparent 70%),
			radial-gradient(600px 200px at 90% 100%, var(--glow-b), transparent 70%),
			var(--panel);
	}
	.closing h2 {
		font-size: 20px;
		margin-bottom: 4px;
	}
	.closing p {
		margin: 0;
		font-size: 13px;
		color: var(--muted);
		max-width: 480px;
		line-height: 1.6;
	}
	.close-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
		margin-top: 34px;
		padding-top: 16px;
		border-top: 1px solid var(--line);
		font-size: 10.5px;
		color: var(--faint);
	}
	.fdot {
		opacity: 0.5;
	}

	@media (max-width: 900px) {
		.home {
			padding: 22px 20px 34px;
		}
		.tracks,
		.road-cols {
			grid-template-columns: 1fr;
		}
		.step-grid,
		.viz-showcase {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 560px) {
		.home {
			padding: 16px 16px 30px;
		}
		h1 {
			font-size: clamp(1.95rem, 9vw, 2.6rem);
		}
		.searchbox {
			flex-wrap: nowrap;
		}
		.searchbox .btn {
			padding: 8px 11px;
		}
		.stats {
			gap: 16px;
		}
		.stats strong {
			font-size: 17px;
		}
		.step-grid,
		.viz-showcase {
			grid-template-columns: 1fr;
		}
		.continue {
			align-items: flex-start;
		}
		.track-card {
			padding: 18px;
		}
		.closing {
			padding: 18px;
		}
	}
</style>
