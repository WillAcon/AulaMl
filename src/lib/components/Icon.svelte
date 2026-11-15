<script lang="ts">
	let {
		name,
		size = 18,
		stroke = 1.8,
		class: className = ''
	}: { name: string; size?: number; stroke?: number; class?: string } = $props();

	const icons: Record<string, string> = {
		search:
			'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
		sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
		moon: '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
		menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
		close: '<path d="M6 6l12 12M18 6L6 18"/>',
		chevron: '<path d="m9 6 6 6-6 6"/>',
		check: '<path d="m5 13 4 4L19 7"/>',
		star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z"/>',
		copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
		play: '<path d="M7 4.5v15l13-7.5Z"/>',
		pause: '<path d="M8 5v14M16 5v14"/>',
		next: '<path d="m9 6 6 6-6 6"/>',
		prev: '<path d="m15 6-6 6 6 6"/>',
		reset: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/>',
		external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
		book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 5.5V21"/>',
		code: '<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>',
		spark: '<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>',
		arrowRight: '<path d="M4 12h16M14 6l6 6-6 6"/>',
		arrowLeft: '<path d="M20 12H4M10 6l-6 6 6 6"/>',
		terminal: '<path d="m5 7 4 5-4 5M12 17h7"/>',
		bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9c-.5.4-.8 1-.8 1.6V16h-5.4v-.5c0-.6-.3-1.2-.8-1.6A6 6 0 0 1 12 3Z"/>',
		alert: '<path d="M12 3 2 20h20Z"/><path d="M12 9v5M12 17h.01"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
		trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
		pencil: '<path d="M4 20h4L20 8l-4-4L4 16Z"/><path d="m14 6 4 4"/>',
		filter: '<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>',
		list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
		home: '<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
		grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
		clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
		target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
		layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
		keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
		'arrow-up': '<path d="M12 20V4M6 10l6-6 6 6"/>'
	};

	const markup = $derived(icons[name] ?? icons.info);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class={className}
>
	{@html markup}
</svg>
