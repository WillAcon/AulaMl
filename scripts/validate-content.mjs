#!/usr/bin/env node
/**
 * Valida el contenido educativo de AulaML.
 * Uso: node scripts/validate-content.mjs [--solo=py-02-variables-tipos]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('src/lib/content');
const CURRICULUM = path.resolve('src/lib/data/curriculum.json');
const args = process.argv.slice(2);
const onlyArg = args.find((arg) => arg.startsWith('--solo='));
const only = onlyArg ? onlyArg.split('=')[1] : null;

const errors = [];
const warnings = [];
const stats = [];

const walk = (dir) =>
	fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		return entry.isDirectory() ? walk(full) : entry.name.endsWith('.json') ? [full] : [];
	});

const isText = (value, min = 1) => typeof value === 'string' && value.trim().length >= min;
const isArr = (value, min = 0) => Array.isArray(value) && value.length >= min;

function fail(file, message) {
	errors.push(`${path.relative(process.cwd(), file)}: ${message}`);
}
function warn(file, message) {
	warnings.push(`${path.relative(process.cwd(), file)}: ${message}`);
}

const files = walk(ROOT).sort();
const lessons = new Map();
const orderByTrack = new Map();

for (const file of files) {
	let data;
	try {
		data = JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch (error) {
		fail(file, `JSON inválido: ${error.message}`);
		continue;
	}

	const name = path.basename(file, '.json');
	const rel = path.relative(ROOT, file).split(path.sep);
	if (rel.length < 2) fail(file, 'debe estar dentro de content/python o content/cpp');
	if (data.id !== name) fail(file, `el id "${data.id}" no coincide con el archivo "${name}"`);
	if (!['python', 'cpp'].includes(data.track)) fail(file, 'track debe ser "python" o "cpp"');
	else if (rel[0] !== data.track) fail(file, `track "${data.track}" no coincide con la carpeta "${rel[0]}"`);

	if (lessons.has(data.id)) fail(file, `id duplicado: ${data.id}`);
	lessons.set(data.id, { data, file });

	if (!isText(data.title, 8)) fail(file, 'title inválido');
	if (!isText(data.subtitle, 20)) fail(file, 'subtitle debe explicar la lección (20+ caracteres)');
	if (!isText(data.summary, 60)) fail(file, 'summary debe tener al menos 60 caracteres');
	if (!['principiante', 'intermedio', 'avanzado'].includes(data.level)) fail(file, 'level inválido');
	if (!Number.isFinite(data.minutes) || data.minutes < 10 || data.minutes > 120)
		fail(file, 'minutes debe estar entre 10 y 120');
	if (!Number.isFinite(data.order)) fail(file, 'order debe ser numérico');
	if (!isArr(data.objectives, 3)) fail(file, 'objectives debe tener al menos 3 elementos');
	if (!isArr(data.tags, 2)) fail(file, 'tags debe tener al menos 2 elementos');
	if (!isArr(data.keywords, 6)) fail(file, 'keywords debe tener al menos 6 elementos');

	const trackOrders = orderByTrack.get(data.track) ?? new Set();
	if (trackOrders.has(data.order)) warn(file, `order ${data.order} repetido en ${data.track}`);
	trackOrders.add(data.order);
	orderByTrack.set(data.track, trackOrders);

	if (!isArr(data.blocks, 12)) {
		fail(file, 'blocks debe tener al menos 12 bloques');
		continue;
	}

	const counts = {};
	const headings = [];
	let words = 0;

	data.blocks.forEach((block, index) => {
		const where = `bloque ${index} (${block?.type})`;
		if (!block || typeof block !== 'object') return fail(file, `${where} inválido`);
		counts[block.type] = (counts[block.type] ?? 0) + 1;

		const textOf = (value) => {
			if (typeof value === 'string') words += value.replace(/`[^`]*`/g, ' ').split(/\s+/).length;
		};

		switch (block.type) {
			case 'p':
				if (!isText(block.md, 20)) fail(file, `${where}: párrafo demasiado corto`);
				textOf(block.md);
				break;
			case 'h':
				if (!isText(block.text, 3)) fail(file, `${where}: título inválido`);
				headings.push(block.text);
				break;
			case 'code':
				if (!isText(block.code, 10)) fail(file, `${where}: código vacío`);
				break;
			case 'list':
				if (!isArr(block.items, 2)) fail(file, `${where}: se esperaban 2+ items`);
				else block.items.forEach((item) => textOf(item));
				break;
			case 'table':
				if (!isArr(block.head, 2)) fail(file, `${where}: cabecera inválida`);
				if (!isArr(block.rows, 1)) fail(file, `${where}: filas insuficientes`);
				else
					block.rows.forEach((row, rowIndex) => {
						if (!Array.isArray(row) || row.length !== block.head.length)
							fail(file, `${where}: la fila ${rowIndex} no tiene ${block.head.length} celdas`);
						row.forEach((cell) => textOf(cell));
					});
				break;
			case 'callout':
				if (!['info', 'tip', 'warn', 'danger', 'success'].includes(block.tone ?? 'info'))
					fail(file, `${where}: tone inválido`);
				if (!isText(block.md, 20)) fail(file, `${where}: texto insuficiente`);
				textOf(block.md);
				break;
			case 'compare':
				if (!isText(block.python?.code, 5) || !isText(block.cpp?.code, 5))
					fail(file, `${where}: faltan los dos códigos`);
				break;
			case 'diff':
				if (!isText(block.wrong?.code, 5) || !isText(block.right?.code, 5))
					fail(file, `${where}: faltan wrong/right`);
				if (!isText(block.explain, 20)) warn(file, `${where}: añade una explicación del error`);
				break;
			case 'trace': {
				if (!isText(block.code, 5)) fail(file, `${where}: falta el código`);
				if (!isArr(block.steps, 2)) fail(file, `${where}: se esperaban 2+ pasos`);
				const lineCount = block.code.split('\n').length;
				block.steps?.forEach((step, stepIndex) => {
					if (!Number.isFinite(step.line) || step.line < 1 || step.line > lineCount)
						fail(file, `${where}: el paso ${stepIndex} apunta a una línea inexistente (${step.line})`);
					if (step.vars && typeof step.vars !== 'object')
						fail(file, `${where}: vars del paso ${stepIndex} inválido`);
					if (step.frames && !Array.isArray(step.frames))
						fail(file, `${where}: frames del paso ${stepIndex} inválido`);
				});
				break;
			}
			case 'slice':
				if (!isText(block.string, 3)) fail(file, `${where}: string inválido`);
				if (block.step === 0) fail(file, `${where}: step no puede ser 0`);
				break;
			case 'memory':
				if (!isArr(block.steps, 1)) fail(file, `${where}: se esperaba 1+ paso`);
				block.steps?.forEach((step, stepIndex) => {
					if (!step.stack && !step.heap) fail(file, `${where}: paso ${stepIndex} sin celdas`);
				});
				break;
			case 'matrix':
				if (!isArr(block.data, 1) || !isArr(block.data[0], 1)) fail(file, `${where}: matriz inválida`);
				else {
					const width = block.data[0].length;
					block.data.forEach((row, rowIndex) => {
						if (!Array.isArray(row) || row.length !== width)
							fail(file, `${where}: la fila ${rowIndex} no tiene ${width} columnas`);
						row.forEach((value) => {
							if (typeof value !== 'number') fail(file, `${where}: valor no numérico`);
						});
					});
				}
				break;
			case 'quiz':
				if (!isText(block.question, 15)) fail(file, `${where}: pregunta inválida`);
				if (!isArr(block.options, 3)) fail(file, `${where}: se esperaban 3+ opciones`);
				if (!Number.isInteger(block.answer) || block.answer < 0 || block.answer >= (block.options?.length ?? 0))
					fail(file, `${where}: answer fuera de rango`);
				if (!isText(block.explain, 20)) warn(file, `${where}: falta la explicación`);
				break;
			case 'fill': {
				if (!isText(block.code, 5)) fail(file, `${where}: código inválido`);
				const blanks = (block.code.match(/___/g) ?? []).length;
				if (!isArr(block.answers, 1)) fail(file, `${where}: faltan respuestas`);
				else if (blanks !== block.answers.length)
					fail(file, `${where}: ${blanks} huecos ___ pero ${block.answers.length} respuestas`);
				break;
			}
			case 'exercise':
				if (!isText(block.title, 5)) fail(file, `${where}: título inválido`);
				if (!isText(block.md, 30)) fail(file, `${where}: enunciado insuficiente`);
				if (!isText(block.solution?.code, 5)) fail(file, `${where}: falta la solución`);
				textOf(block.md);
				break;
			case 'links':
				if (!isArr(block.items, 1)) fail(file, `${where}: enlaces insuficientes`);
				block.items?.forEach((item) => {
					if (!/^https?:\/\//.test(item.url ?? '')) fail(file, `${where}: URL inválida`);
				});
				break;
			default:
				fail(file, `${where}: tipo desconocido`);
		}
	});

	const viz = (counts.trace ?? 0) + (counts.slice ?? 0) + (counts.memory ?? 0) + (counts.matrix ?? 0);
	if (!viz) fail(file, 'falta al menos una visualización (trace/slice/memory/matrix)');
	if (!counts.quiz) fail(file, 'falta al menos una evaluación (quiz)');
	if (!counts.exercise) fail(file, 'falta al menos un ejercicio');
	if (!counts.code) fail(file, 'faltan ejemplos de código');
	if (!counts.callout) fail(file, 'falta al menos un callout');
	if (!(counts.table || counts.compare)) fail(file, 'falta una tabla o comparación');
	if ((counts.h ?? 0) < 8) fail(file, `solo ${counts.h ?? 0} secciones h; se esperaban 8+`);
	if (words < 700) warn(file, `contenido corto: ${words} palabras de prosa (se esperaban 700+)`);

	const normalized = headings.map((heading) =>
		heading
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
	);
	const expected = [
		['que es', 'que son'],
		['para que'],
		['como funciona', 'por dentro', 'fundamento'],
		['sintaxis'],
		['ejemplo'],
		['error'],
		['buena', 'practica'],
		['ejercicio'],
		['resumen'],
		['evaluacion', 'comprueba', 'pon a prueba']
	];
	const covered = expected.filter((options) =>
		normalized.some((heading) => options.some((option) => heading.includes(option)))
	).length;
	if (covered < 8) warn(file, `estructura pedagógica incompleta: ${covered}/10 secciones clave`);

	stats.push({
		file,
		id: data.id,
		words,
		h: counts.h ?? 0,
		viz,
		quizzes: counts.quiz ?? 0,
		exercises: counts.exercise ?? 0
	});
}

// Comprobar que el currículo referencia exactamente las lecciones existentes
if (!only) {
	const curriculum = JSON.parse(fs.readFileSync(CURRICULUM, 'utf8'));
	const listed = new Set(
		curriculum.tracks.flatMap((track) => track.modules.flatMap((mod) => mod.lessons))
	);
	for (const id of listed) {
		if (!lessons.has(id)) errors.push(`curriculum.json: referencia a lección inexistente "${id}"`);
	}
	for (const id of lessons.keys()) {
		if (!listed.has(id)) errors.push(`curriculum.json: la lección "${id}" no está en ningún módulo`);
	}
}

const selected = only ? stats.filter((item) => item.id === only) : stats;
const selectedErrors = only
	? errors.filter((message) => message.includes(only))
	: errors;
const selectedWarnings = only
	? warnings.filter((message) => message.includes(only))
	: warnings;

console.log(`\nAulaML · validación de contenido`);
console.log('─'.repeat(64));
for (const item of selected) {
	console.log(
		`${item.id.padEnd(30)} ${String(item.words).padStart(4)} pal · ${item.h} sec · ${item.viz} viz · ${item.quizzes} quiz · ${item.exercises} ej`
	);
}
console.log('─'.repeat(64));
console.log(`Lecciones: ${selected.length}`);

if (selectedWarnings.length) {
	console.log(`\nAvisos (${selectedWarnings.length}):`);
	for (const message of selectedWarnings) console.log(`  · ${message}`);
}

if (selectedErrors.length) {
	console.log(`\nErrores (${selectedErrors.length}):`);
	for (const message of selectedErrors) console.log(`  ✗ ${message}`);
	console.log('');
	process.exit(1);
}

console.log('\n✓ Contenido válido\n');
