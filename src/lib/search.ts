import { allLessons, moduleTitleByLesson } from './data';
import { blockToText, buildToc } from './md';
import type { SearchDoc, SearchHit, SearchSection, TrackId } from './types';

const STOPWORDS = new Set(
	[
		'de','la','el','los','las','un','una','unos','unas','y','o','u','e','en','con','sin','por','para',
		'que','qué','como','cómo','cuando','cuándo','donde','dónde','es','son','ser','esta','está','este',
		'esto','estos','al','del','se','su','sus','lo','le','les','mi','tu','mis','tus','mas','más','muy',
		'pero','si','sí','no','ya','hay','funciona','funcionan','funcionamiento','usar','uso','usa','usando',
		'ejemplo','ejemplos','explicar','explícame','explica','quiero','saber','sobre','diferencia','diferencias',
		'versus','vs','puedo','hacer','sirve','sirven','cuál','cual','cuales','cuáles','tengo','entender',
		'aprender','tema','concepto','significa','significado','trabaja','trabajan','tiene','tienen','dar','dame'
	].map(normalize)
);

const SYNONYMS: Record<string, string[]> = {
	lista: ['listas', 'array', 'arreglo', 'list'],
	tupla: ['tuplas', 'tuple', 'inmutable'],
	diccionario: ['dict', 'mapa', 'hash', 'clave', 'valor'],
	conjunto: ['set', 'sets', 'hashset'],
	conjuntos: ['conjunto', 'set', 'sets', 'hashset'],
	interseccion: ['intersection', '&'],
	intersection: ['interseccion', '&'],
	union: ['|', 'union_update'],
	diferencia: ['difference', '-'],
	difference: ['diferencia', '-'],
	symmetric_difference: ['diferencia simetrica', '^'],
	issubset: ['subconjunto', 'subset', '<='],
	issuperset: ['superconjunto', 'superset', '>='],
	isdisjoint: ['disjunto', 'disjuntos'],
	subconjunto: ['issubset', 'subset'],
	superconjunto: ['issuperset', 'superset'],
	disjunto: ['isdisjoint'],
	setdefault: ['diccionario', 'dict', 'valor por defecto'],
	popitem: ['diccionario', 'dict'],
	frozenset: ['conjunto inmutable', 'set inmutable'],
	cadena: ['string', 'texto', 'str', 'caracteres'],
	texto: ['string', 'cadena'],
	funcion: ['function', 'def', 'metodo', 'parametro', 'retorno'],
	metodo: ['method', 'funcion'],
	bucle: ['loop', 'for', 'while', 'iteracion', 'repetir'],
	iteracion: ['bucle', 'iterador'],
	condicional: ['if', 'else', 'elif', 'decision', 'condicion'],
	condicion: ['if', 'condicional', 'booleano'],
	booleano: ['bool', 'true', 'false', 'logico'],
	operador: ['operadores', 'aritmetico', 'logico', 'comparacion'],
	puntero: ['punteros', 'pointer', 'direccion', 'memoria', 'nullptr'],
	referencia: ['referencias', 'reference', 'ampersand', 'paso por referencia'],
	memoria: ['stack', 'heap', 'puntero', 'ram', 'asignacion', 'new', 'delete'],
	clase: ['clases', 'class', 'objeto', 'oop', 'poo'],
	objeto: ['objetos', 'instancia', 'clase'],
	herencia: ['heredar', 'subclase', 'superclase', 'polimorfismo', 'virtual'],
	polimorfismo: ['virtual', 'override', 'herencia'],
	encapsulamiento: ['private', 'public', 'protected', 'getter', 'setter'],
	constructor: ['init', '__init__', 'inicializar', 'new'],
	destructor: ['delete', 'raii', 'libera'],
	error: ['errores', 'excepcion', 'excepciones', 'exception', 'try', 'except', 'catch', 'throw'],
	excepcion: ['error', 'try', 'except', 'catch', 'raise', 'throw'],
	archivo: ['archivos', 'fichero', 'file', 'open', 'json', 'csv', 'leer', 'escribir'],
	json: ['archivo', 'serializar', 'dumps', 'loads'],
	generador: ['generadores', 'yield', 'iterador', 'lazy'],
	iterador: ['iteradores', 'iter', 'next', 'generador', 'for'],
	decorador: ['decoradores', 'decorator', 'wrapper', 'closure'],
	closure: ['decorador', 'scope', 'alcance'],
	recursividad: ['recursiva', 'recursivo', 'recursion', 'factorial', 'fibonacci'],
	lambda: ['anonima', 'funcion anonima', 'map', 'filter', 'reduce'],
	slicing: ['slice', 'rebanado', 'corte', 'indice', 'indices', 'start', 'stop', 'step'],
	vector: ['vectores', 'std::vector', 'array dinamico', 'push_back'],
	matriz: ['matrices', 'matrix', 'algebra lineal', 'eigen', 'tensor'],
	grafico: ['grafica', 'plot', 'matplotlib', 'seaborn', 'visualizacion', 'figura', 'chart'],
	visualizacion: ['grafico', 'plot', 'matplotlib', 'seaborn', 'diagrama'],
	dataframe: ['pandas', 'data frame', 'tabla', 'csv', 'columna'],
	limpieza: ['limpiar', 'nan', 'nulos', 'duplicados', 'outliers'],
	estadistica: ['media', 'mediana', 'desviacion', 'distribucion', 'probabilidad'],
	modelo: ['machine learning', 'entrenar', 'prediccion', 'sklearn', 'algoritmo'],
	entrenamiento: ['train', 'fit', 'modelo', 'epocas', 'epochs'],
	regresion: ['linear', 'logistica', 'prediccion', 'mse', 'error cuadratico'],
	arbol: ['decision tree', 'random forest', 'bosque', 'clasificacion'],
	cluster: ['kmeans', 'k-means', 'agrupamiento', 'no supervisado'],
	validacion: ['cross validation', 'train test', 'overfitting', 'metricas'],
	red: ['neuronal', 'neural', 'pytorch', 'tensorflow', 'deep learning'],
	neuronal: ['neurona', 'pytorch', 'deep learning', 'red'],
	transformer: ['attention', 'nlp', 'embedding', 'gpt', 'bert'],
	embedding: ['vectores', 'nlp', 'transformer', 'representacion'],
	compilador: ['g++', 'clang', 'gcc', 'compilar', 'build', 'cmake'],
	cmake: ['compilador', 'build', 'proyecto', 'make'],
	template: ['templates', 'generico', 'typename', 'generic'],
	puntero_inteligente: ['unique_ptr', 'shared_ptr', 'weak_ptr', 'raii', 'smart pointer'],
	stl: ['vector', 'map', 'set', 'algoritmo', 'iterador', 'contenedor'],
	algoritmo: ['algoritmos', 'sort', 'find', 'complejidad', 'big o'],
	complejidad: ['big o', 'rendimiento', 'optimizacion', 'cache'],
	rendimiento: ['performance', 'optimizacion', 'benchmark', 'profiling', 'velocidad'],
	paralelismo: ['thread', 'hilos', 'openmp', 'simd', 'concurrencia'],
	concurrencia: ['thread', 'hilos', 'asyncio', 'paralelo', 'mutex'],
	pybind11: ['binding', 'bindings', 'interoperabilidad', 'extension', 'python c++'],
	numpy: ['array', 'ndarray', 'vector', 'matriz', 'vectorizacion'],
	pandas: ['dataframe', 'serie', 'csv', 'analisis'],
	pytorch: ['tensor', 'red neuronal', 'deep learning', 'autograd'],
	sklearn: ['scikit-learn', 'modelo', 'clasificador', 'regresor'],
	entorno: ['venv', 'virtualenv', 'pip', 'dependencias', 'instalacion'],
	modulo: ['paquete', 'import', 'package', 'libreria'],
	testing: ['test', 'pytest', 'prueba', 'unit test', 'assert'],
	logging: ['log', 'logs', 'registro', 'debug'],
	asyncio: ['async', 'await', 'corrutina', 'concurrencia'],
	async: ['asyncio', 'await', 'corrutina'],
	pila: ['stack', 'lifo', 'push', 'pop'],
	cola: ['queue', 'fifo', 'push', 'pop'],
	'paso por referencia': ['referencia', 'ampersand', 'modificar', 'c++'],
	'smart pointer': ['unique_ptr', 'shared_ptr', 'puntero inteligente']
};

export function normalize(value: string): string {
	return String(value ?? '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9_+#.]+/g, ' ')
		.trim();
}

export function tokenize(value: string): string[] {
	return normalize(value)
		.split(/\s+/)
		.map((token) => token.replace(/^\.+|\.+$/g, ''))
		.filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}

interface IndexedSection extends SearchSection {
	tokens: string[];
}

interface IndexedDoc {
	doc: SearchDoc;
	titleTokens: string[];
	keywordTokens: string[];
	tagTokens: string[];
	sections: IndexedSection[];
	tokenSet: Set<string>;
}

function buildSections(lesson: (typeof allLessons)[number]): IndexedSection[] {
	const toc = buildToc(lesson.blocks);
	const tocByIndex = new Map(toc.map((item) => [item.index, item]));
	const sections: IndexedSection[] = [];
	let current: IndexedSection = {
		id: 'inicio',
		heading: 'Resumen',
		text: [lesson.summary ?? '', ...(lesson.objectives ?? []), ...(lesson.prerequisites ?? [])].join('. '),
		tokens: []
	};

	lesson.blocks.forEach((block, index) => {
		const heading = tocByIndex.get(index);
		if (heading) {
			sections.push(current);
			current = { id: heading.id, heading: heading.text, text: '', tokens: [] };
			return;
		}
		current.text += ' ' + blockToText(block);
	});
	sections.push(current);

	return sections
		.map((section) => ({
			...section,
			text: section.text.replace(/\s+/g, ' ').trim(),
			tokens: [...new Set(tokenize(`${section.heading} ${section.text}`))]
		}))
		.filter((section) => section.text.length > 0);
}

let INDEX: IndexedDoc[] | null = null;

function getIndex(): IndexedDoc[] {
	if (INDEX) return INDEX;
	INDEX = allLessons.map((lesson) => {
		const doc: SearchDoc = {
			id: lesson.id,
			track: lesson.track,
			title: lesson.title,
			subtitle: lesson.subtitle ?? '',
			module: moduleTitleByLesson.get(lesson.id) ?? lesson.module ?? '',
			level: lesson.level,
			tags: lesson.tags ?? [],
			keywords: lesson.keywords ?? [],
			summary: lesson.summary ?? '',
			sections: [],
			all: ''
		};
		const sections = buildSections(lesson);
		doc.sections = sections.map(({ id, heading, text }) => ({ id, heading, text }));
		doc.all = normalize(
			[
				doc.title,
				doc.subtitle,
				doc.module,
				doc.summary,
				...doc.tags,
				...doc.keywords,
				...sections.map((section) => section.text)
			].join(' ')
		);
		return {
			doc,
			titleTokens: [...new Set(tokenize(`${doc.title} ${doc.subtitle}`))],
			keywordTokens: [...new Set(tokenize(doc.keywords.join(' ')))],
			tagTokens: [...new Set(tokenize(doc.tags.join(' ')))],
			sections,
			tokenSet: new Set(doc.all.split(' '))
		};
	});
	return INDEX;
}

const matches = (word: string, variant: string) =>
	word === variant || word.startsWith(variant) || variant.startsWith(word);

function expand(token: string): string[] {
	const out = new Set<string>([token]);
	const direct = SYNONYMS[token];
	if (direct) for (const item of direct) for (const part of tokenize(item)) out.add(part);
	for (const [key, values] of Object.entries(SYNONYMS)) {
		if (values.some((value) => tokenize(value).includes(token))) {
			out.add(key);
			for (const value of values) for (const part of tokenize(value)) out.add(part);
		}
	}
	return [...out];
}

function makeSnippet(section: SearchSection, tokens: string[]): string {
	const clean = section.text
		.replace(/`/g, '')
		.replace(/\*\*/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
	const sentences = clean.split(/(?<=[.!?])\s+/);
	const hit = sentences.find((sentence) => {
		const normalized = normalize(sentence);
		return tokens.some((token) => normalized.includes(token));
	});
	let text = hit ?? sentences[0] ?? clean;
	if (text.length > 230) text = text.slice(0, 227).replace(/\s+\S*$/, '') + '…';
	return text;
}

export interface SearchOptions {
	track?: TrackId | 'all';
	limit?: number;
}

export function search(rawQuery: string, options: SearchOptions = {}): SearchHit[] {
	const queryTokens = [...new Set(tokenize(rawQuery))];
	if (!queryTokens.length) return [];
	const index = getIndex();
	const phrase = normalize(rawQuery);
	const track = options.track ?? 'all';
	const limit = options.limit ?? 20;

	const hits: SearchHit[] = [];

	for (const entry of index) {
		if (track !== 'all' && entry.doc.track !== track) continue;

		let score = 0;
		let covered = 0;
		const matched: string[] = [];
		const sectionScores = new Map<number, number>();

		for (const token of queryTokens) {
			let tokenScore = 0;
			const sectionScoresLocal = new Map<number, number>();

			const applyVariant = (variant: string, weight: number, strong: boolean) => {
				if (entry.titleTokens.some((word) => matches(word, variant)))
					tokenScore += (strong ? 34 : 16) * weight;
				else if (normalize(entry.doc.title).includes(variant))
					tokenScore += (strong ? 26 : 12) * weight;

				if (entry.keywordTokens.some((word) => matches(word, variant)))
					tokenScore += (strong ? 24 : 9) * weight;
				if (entry.tagTokens.some((word) => matches(word, variant)))
					tokenScore += (strong ? 16 : 6) * weight;

				let bodyHits = 0;
				let headingHits = 0;
				entry.sections.forEach((section, sectionIndex) => {
					let local = 0;
					if (bodyHits < 4 && section.tokens.some((word) => matches(word, variant))) {
						local += strong ? 5 : 2;
						bodyHits++;
					}
					if (headingHits < 4 && normalize(section.heading).includes(variant)) {
						local += strong ? 12 : 5;
						headingHits++;
					}
					if (local) {
						sectionScoresLocal.set(
							sectionIndex,
							(sectionScoresLocal.get(sectionIndex) ?? 0) + local * weight
						);
						tokenScore += local * weight;
					}
				});
			};

			applyVariant(token, 1, true);
			for (const variant of expand(token)) {
				if (variant !== token) applyVariant(variant, 0.45, false);
			}

			tokenScore = Math.min(tokenScore, 130);
			for (const [sectionIndex, local] of sectionScoresLocal) {
				sectionScores.set(sectionIndex, (sectionScores.get(sectionIndex) ?? 0) + local);
			}

			if (tokenScore > 0) {
				covered++;
				score += tokenScore;
				matched.push(token);
			}
		}

		if (!covered) continue;
		score += (covered / queryTokens.length) * 14;
		if (phrase.length > 2 && normalize(entry.doc.title).includes(phrase)) score += 40;
		if (phrase.length > 2 && normalize(entry.doc.summary).includes(phrase)) score += 12;
		if (phrase.length > 2 && normalize(entry.doc.keywords.join(' ')).includes(phrase)) score += 34;

		let bestSection = 0;
		for (const [sectionIndex, sectionScore] of sectionScores) {
			if (sectionScore > (sectionScores.get(bestSection) ?? -1)) bestSection = sectionIndex;
		}
		const section = entry.sections[bestSection] ?? entry.sections[0];

		hits.push({
			doc: entry.doc,
			score,
			sectionId: section?.id,
			snippet: section ? makeSnippet(section, queryTokens) : entry.doc.summary,
			matched
		});
	}

	hits.sort(
		(a, b) =>
			b.score - a.score ||
			(a.doc.track === b.doc.track ? 0 : a.doc.track === 'python' ? -1 : 1) ||
			a.doc.title.localeCompare(b.doc.title)
	);
	// Evita llenar la lista con coincidencias marginales de sinónimos.
	const best = hits[0]?.score ?? 0;
	const threshold = Math.max(10, best * 0.18);
	return hits.filter((hit) => hit.score >= threshold).slice(0, limit);
}

export const suggestedQueries = [
	'if / else',
	'lista vs tupla',
	'slicing',
	'paso por referencia',
	'punteros y memoria',
	'lambda',
	'función recursiva',
	'decoradores',
	'DataFrame',
	'templates'
];
