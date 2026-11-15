/** Utilidades de texto: escape, slugs, render inline de markdown y TOC. */
import type { Block } from './types';

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function slugify(text: string): string {	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64);
}

/** Render limitado de markdown inline. Escapa HTML antes de insertar etiquetas. */
export function inline(md = ''): string {
	const slots: string[] = [];
	let text = String(md).replace(/`([^`]+)`/g, (_, code) => {
		slots.push(`<code>${escapeHtml(code)}</code>`);
		return `\u0000${slots.length - 1}\u0000`;
	});

	text = escapeHtml(text);
	text = text.replace(
		/\[([^\]]+)\]\(([^)\s]+)\)/g,
		(_, label, href) =>
			`<a href="${href}"${/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`
	);
	text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	text = text.replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
	text = text.replace(
		/(^|[\s(])_([^_\n]+)_(?=[\s).,;:!?]|$)/g,
		'$1<em>$2</em>'
	);
	text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[Number(i)] ?? '');
	return text;
}

export interface TocItem {
	id: string;
	text: string;
	index: number;
}

/** Genera ids únicos para cada bloque `h` y devuelve el índice del bloque. */
export function buildToc(blocks: Block[]): TocItem[] {
	const used = new Map<string, number>();
	const items: TocItem[] = [];
	blocks.forEach((block, index) => {
		if (block.type !== 'h') return;
		const base = slugify(block.text) || 'seccion';
		const seen = used.get(base) ?? 0;
		used.set(base, seen + 1);
		items.push({ id: seen ? `${base}-${seen + 1}` : base, text: block.text, index });
	});
	return items;
}

/** Texto plano de un bloque, usado para el índice de búsqueda. */
export function blockToText(block: Block): string {
	switch (block.type) {
		case 'p':
		case 'callout':
			return `${block.title ? block.title + '. ' : ''}${block.md}`;
		case 'h':
			return block.text;
		case 'code':
		case 'trace':
			return [block.caption, block.code].filter(Boolean).join(' ');
		case 'list':
			return block.items.join(' ');
		case 'table':
			return [...block.head, ...block.rows.flat()].join(' ');
		case 'compare':
			return [
				block.title,
				block.note,
				block.python.code,
				block.python.caption,
				block.cpp.code,
				block.cpp.caption
			]
				.filter(Boolean)
				.join(' ');
		case 'diff':
			return [block.title, block.explain, block.wrong.code, block.right.code]
				.filter(Boolean)
				.join(' ');
		case 'slice':
			return [block.title, block.note, block.string].filter(Boolean).join(' ');
		case 'memory':
			return [
				block.title,
				block.code,
				...block.steps.flatMap((s) => [
					s.note ?? '',
					...(s.stack ?? []).map((c) => `${c.name} ${c.value}`),
					...(s.heap ?? []).map((c) => `${c.name} ${c.value}`)
				])
			]
				.filter(Boolean)
				.join(' ');
		case 'matrix':
			return [block.title, ...block.data.flat().map(String)].join(' ');
		case 'quiz':
			return [block.question, ...block.options, block.explain].filter(Boolean).join(' ');
		case 'fill':
			return [block.title, block.code, block.hint, block.explain].filter(Boolean).join(' ');
		case 'exercise':
			return [block.title, block.md, block.hint, block.solution.code, block.solution.explain]
				.filter(Boolean)
				.join(' ');
		case 'links':
			return block.items.map((i) => `${i.label} ${i.note ?? ''}`).join(' ');
		default:
			return '';
	}
}

const ACCENTS: Record<string, string> = {
	a: '[aáàä]',
	e: '[eéèë]',
	i: '[iíìï]',
	o: '[oóòö]',
	u: '[uúüù]',
	n: '[nñ]',
	c: '[cç]'
};

/** Escapa el texto y envuelve en <mark> las coincidencias de los tokens. */
export function highlightText(text: string, tokens: string[]): string {
	let out = escapeHtml(text);
	const valid = [...new Set(tokens)]
		.filter((token) => token.length >= 2)
		.sort((a, b) => b.length - a.length);
	if (!valid.length) return out;
	const pattern = valid
		.map((token) =>
			[...token]
				.map((char) => ACCENTS[char] ?? char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
				.join('')
		)
		.join('|');
	try {
		out = out.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
	} catch {
		/* patrón inválido: devolver sin resaltado */
	}
	return out;
}
