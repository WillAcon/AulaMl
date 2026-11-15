#!/usr/bin/env node
/**
 * Auditoría de cobertura temática contra el temario original.
 * Comprueba que cada tema tenga lección y que los conceptos clave aparezcan en su contenido.
 *
 * Uso:
 *   node scripts/audit-topics.mjs
 *   node scripts/audit-topics.mjs --write     # genera docs/COBERTURA.md
 */
import fs from 'node:fs';
import path from 'node:path';

const WRITE = process.argv.includes('--write');
const CONTENT = path.resolve('src/lib/content');

const TOPICS = {
	python: [
		{ module: 'M1. Introducción', topic: 'Qué es Python, instalación y REPL', lesson: 'py-01-que-es-python', terms: ['repl', 'python3', 'instal'] },
		{ module: 'M1. Introducción', topic: 'Variables y tipos de datos', lesson: 'py-02-variables-tipos', terms: ['int', 'float', 'str', 'bool', 'type('] },
		{ module: 'M1. Introducción', topic: 'Operadores aritméticos, lógicos y relacionales', lesson: 'py-03-operadores', terms: ['and', 'or', 'not', '//', '%'] },
		{ module: 'M2. Control', topic: 'if / elif / else y operadores lógicos', lesson: 'py-04-condicionales', terms: ['if', 'elif', 'else'] },
		{ module: 'M2. Control', topic: 'Operador ternario y match/case', lesson: 'py-04-condicionales', terms: ['ternario', 'match'] },
		{ module: 'M2. Control', topic: 'while, for y range', lesson: 'py-05-bucles', terms: ['while', 'for', 'range'] },
		{ module: 'M2. Control', topic: 'break, continue, pass y bucles anidados', lesson: 'py-05-bucles', terms: ['break', 'continue', 'pass', 'anidad'] },
		{ module: 'M3. Estructuras', topic: 'Strings, índices y slicing', lesson: 'py-06-strings', terms: ['slicing', 'split', 'join', 'strip'] },
		{ module: 'M3. Estructuras', topic: 'Listas, tuplas y mutabilidad', lesson: 'py-07-listas-tuplas', terms: ['append', 'pop', 'tupla', 'mutable'] },
		{ module: 'M3. Estructuras', topic: 'Diccionarios y conjuntos', lesson: 'py-08-diccionarios-sets', terms: ['get(', 'items(', 'set(', 'union'] },
		{ module: 'M3. Estructuras', topic: 'Recorridos y comprensiones', lesson: 'py-09-comprensiones', terms: ['enumerate', 'zip', 'comprensi'] },
		{ module: 'M4. Funciones', topic: 'def, parámetros, return y valores por defecto', lesson: 'py-10-funciones', terms: ['def ', 'return', 'docstring'] },
		{ module: 'M4. Funciones', topic: '*args, **kwargs, alcance y nonlocal', lesson: 'py-11-args-kwargs-scope', terms: ['*args', '**kwargs', 'nonlocal', 'global'] },
		{ module: 'M4. Funciones', topic: 'Lambda, map, filter, reduce y funciones como objetos', lesson: 'py-12-lambda-recursividad', terms: ['lambda', 'map(', 'filter(', 'reduce('] },
		{ module: 'M4. Funciones', topic: 'Recursividad y pila de llamadas', lesson: 'py-12-lambda-recursividad', terms: ['recursi', 'caso base'] },
		{ module: 'M5. POO', topic: 'Clases, objetos, __init__, self y encapsulamiento', lesson: 'py-13-clases', terms: ['class ', '__init__', 'self'] },
		{ module: 'M5. POO', topic: 'Herencia, polimorfismo y abstracción', lesson: 'py-14-herencia', terms: ['super(', 'hereda', 'polimorf', 'abstract'] },
		{ module: 'M5. POO', topic: 'Métodos especiales, properties, static y classmethod', lesson: 'py-15-dunder', terms: ['__str__', '__repr__', '@property', '@staticmethod', '@classmethod'] },
		{ module: 'M5. POO', topic: 'Composición y diseño de clases', lesson: 'py-16-composicion', terms: ['composici', 'inyecci'] },
		{ module: 'M6. Errores y archivos', topic: 'try/except/else/finally, raise y excepciones propias', lesson: 'py-17-excepciones', terms: ['try', 'except', 'finally', 'raise'] },
		{ module: 'M6. Errores y archivos', topic: 'Archivos, JSON, CSV y context managers', lesson: 'py-18-archivos', terms: ['open(', 'json', 'csv', 'with '] },
		{ module: 'M7. Avanzado', topic: 'Iteradores y generadores', lesson: 'py-19-iteradores-generadores', terms: ['iter(', 'next(', 'yield'] },
		{ module: 'M7. Avanzado', topic: 'Closures y decoradores', lesson: 'py-20-decoradores', terms: ['closure', 'decorador', 'wraps'] },
		{ module: 'M7. Avanzado', topic: 'Type hints y dataclasses', lesson: 'py-21-tipos-dataclasses', terms: ['dataclass', 'Optional', '->'] },
		{ module: 'M7. Avanzado', topic: 'Módulos, paquetes, pip y entornos virtuales', lesson: 'py-22-modulos-entornos', terms: ['import', 'venv', 'pip'] },
		{ module: 'M7. Avanzado', topic: 'Testing, logging y debugging', lesson: 'py-23-testing-logging', terms: ['pytest', 'assert', 'logging'] },
		{ module: 'M7. Avanzado', topic: 'Concurrencia, multiprocessing y asyncio', lesson: 'py-24-concurrencia', terms: ['thread', 'multiprocessing', 'asyncio', 'await'] },
		{ module: 'M8. Ciencia de datos', topic: 'NumPy: arrays, broadcasting y álgebra lineal', lesson: 'py-25-numpy', terms: ['ndarray', 'shape', 'broadcast'] },
		{ module: 'M8. Ciencia de datos', topic: 'Pandas: Series, DataFrame, loc/iloc y groupby', lesson: 'py-26-pandas', terms: ['dataframe', 'loc', 'iloc', 'groupby'] },
		{ module: 'M8. Ciencia de datos', topic: 'Limpieza de datos: nulos, duplicados y outliers', lesson: 'py-27-limpieza', terms: ['dropna', 'fillna', 'duplicad', 'outlier'] },
		{ module: 'M8. Ciencia de datos', topic: 'Matplotlib, Seaborn y elección de gráficos', lesson: 'py-28-visualizacion', terms: ['matplotlib', 'seaborn', 'plot'] },
		{ module: 'M8. Ciencia de datos', topic: 'Estadística descriptiva y EDA', lesson: 'py-29-eda-estadistica', terms: ['media', 'mediana', 'correlaci', 'distribuci'] },
		{ module: 'M9. Machine Learning', topic: 'Fundamentos de ML: supervisado, features y sesgo-varianza', lesson: 'py-30-fundamentos-ml', terms: ['supervisad', 'feature', 'sesgo', 'varianza'] },
		{ module: 'M9. Machine Learning', topic: 'Álgebra lineal y probabilidad aplicadas', lesson: 'py-30-fundamentos-ml', terms: ['matriz', 'vector', 'probabilidad', 'gradiente'] },
		{ module: 'M9. Machine Learning', topic: 'Regresión lineal y logística', lesson: 'py-31-regresion', terms: ['LinearRegression', 'LogisticRegression', 'MSE', 'sigmoide'] },
		{ module: 'M9. Machine Learning', topic: 'Árboles de decisión y Random Forest', lesson: 'py-32-arboles', terms: ['Gini', 'entrop', 'RandomForest', 'profundidad'] },
		{ module: 'M9. Machine Learning', topic: 'K-Means y aprendizaje no supervisado', lesson: 'py-33-kmeans', terms: ['KMeans', 'centroide', 'codo', 'cluster'] },
		{ module: 'M9. Machine Learning', topic: 'Validación, matriz de confusión y métricas', lesson: 'py-34-validacion', terms: ['cross', 'precisi', 'recall', 'confusi', 'ROC'] },
		{ module: 'M9. Machine Learning', topic: 'scikit-learn', lesson: 'py-31-regresion', terms: ['scikit', 'sklearn'] },
		{ module: 'M9. Machine Learning', topic: 'Redes neuronales con PyTorch', lesson: 'py-35-pytorch', terms: ['torch', 'tensor', 'autograd', 'optimizador'] },
		{ module: 'M9. Machine Learning', topic: 'Introducción a TensorFlow', lesson: 'py-35-pytorch', terms: ['tensorflow'] },
		{ module: 'M9. Machine Learning', topic: 'NLP, embeddings y similitud', lesson: 'py-36-nlp-transformers', terms: ['token', 'embedding', 'similitud'] },
		{ module: 'M9. Machine Learning', topic: 'Transformers, atención y Hugging Face', lesson: 'py-36-nlp-transformers', terms: ['transformer', 'atenci', 'hugging'] },
		{ module: 'M10. Proyectos', topic: 'Proyecto de predicción con API FastAPI', lesson: 'py-37-proyecto-api', terms: ['FastAPI', 'predict', 'Pydantic'] },
		{ module: 'M10. Proyectos', topic: 'Despliegue, Docker, monitoreo y CI/CD', lesson: 'py-38-despliegue', terms: ['Docker', 'monitoreo', 'drift', 'CI'] },
		{ module: 'M10. Proyectos', topic: 'Variantes: clasificador de textos y recomendador', lesson: 'py-37-proyecto-api', terms: ['clasificador', 'recomend'] }
	],
	cpp: [
		{ module: 'M1. Fundamentos', topic: 'Qué es C++, compilador GCC/Clang y estándares', lesson: 'cpp-01-que-es-cpp', terms: ['g++', 'clang', 'compil', 'c++20'] },
		{ module: 'M1. Fundamentos', topic: 'Estructura, main, cout/cin y tipos', lesson: 'cpp-02-estructura-tipos', terms: ['main', 'cout', 'cin', 'sizeof'] },
		{ module: 'M1. Fundamentos', topic: 'Variables, const, auto y operadores', lesson: 'cpp-03-variables-operadores', terms: ['const', 'auto', 'static_cast'] },
		{ module: 'M2. Control', topic: 'if, else if, switch y ternario', lesson: 'cpp-04-condicionales', terms: ['switch', 'case', 'ternario'] },
		{ module: 'M2. Control', topic: 'for, while, do-while y break/continue', lesson: 'cpp-05-bucles', terms: ['while', 'do', 'break', 'continue'] },
		{ module: 'M3. Funciones', topic: 'Declaración, definición, parámetros y return', lesson: 'cpp-06-funciones', terms: ['return', 'void', 'prototipo'] },
		{ module: 'M3. Funciones', topic: 'Paso por valor, referencia y puntero', lesson: 'cpp-07-referencias-sobrecarga', terms: ['referencia', 'puntero', 'valor'] },
		{ module: 'M3. Funciones', topic: 'Sobrecarga, valores por defecto y recursión', lesson: 'cpp-07-referencias-sobrecarga', terms: ['sobrecarga', 'recursi', 'caso base'] },
		{ module: 'M4. Memoria', topic: 'Stack, heap, direcciones y punteros', lesson: 'cpp-08-memoria-punteros', terms: ['stack', 'heap', 'puntero', 'nullptr'] },
		{ module: 'M4. Memoria', topic: 'Referencias, new/delete y fugas', lesson: 'cpp-09-referencias-new-delete', terms: ['new', 'delete', 'fuga'] },
		{ module: 'M4. Memoria', topic: 'RAII y smart pointers', lesson: 'cpp-10-raii-smart-pointers', terms: ['raii', 'unique_ptr', 'shared_ptr', 'weak_ptr'] },
		{ module: 'M5. Estructuras', topic: 'Arrays, std::array, vector y string', lesson: 'cpp-11-arrays-vector', terms: ['std::vector', 'std::array', 'std::string', 'push_back'] },
		{ module: 'M5. Estructuras', topic: 'map, unordered_map, set y list', lesson: 'cpp-12-map-set', terms: ['std::map', 'std::set', 'unordered_map'] },
		{ module: 'M5. Estructuras', topic: 'Pilas, colas y priority_queue', lesson: 'cpp-12-map-set', terms: ['std::stack', 'std::queue', 'priority_queue'] },
		{ module: 'M5. Estructuras', topic: 'Iteradores, range-for y algoritmos STL', lesson: 'cpp-13-iteradores-algoritmos', terms: ['begin()', 'end()', 'std::sort', 'accumulate'] },
		{ module: 'M6. POO', topic: 'Clases, constructores, destructor y encapsulamiento', lesson: 'cpp-14-clases', terms: ['class', 'constructor', 'private', 'public'] },
		{ module: 'M6. POO', topic: 'Herencia, virtual, polimorfismo y clases abstractas', lesson: 'cpp-15-herencia', terms: ['virtual', 'override', 'abstract'] },
		{ module: 'M6. POO', topic: 'Regla de 0/3/5 y sobrecarga de operadores', lesson: 'cpp-16-regla-cinco', terms: ['regla de', 'copia', 'operator+', 'operator<<'] },
		{ module: 'M6. POO', topic: 'Composición e interfaces', lesson: 'cpp-15-herencia', terms: ['composici', 'interfaz'] },
		{ module: 'M7. C++ moderno', topic: 'Templates, variádicas y concepts', lesson: 'cpp-17-templates', terms: ['template', 'typename', 'concept'] },
		{ module: 'M7. C++ moderno', topic: 'Lambdas, captura y range-for', lesson: 'cpp-18-lambdas', terms: ['lambda', '[&]', 'range'] },
		{ module: 'M7. C++ moderno', topic: 'Move semantics, optional y variant', lesson: 'cpp-19-move-optional', terms: ['std::move', 'std::optional', 'std::variant'] },
		{ module: 'M7. C++ moderno', topic: 'Excepciones y std::thread', lesson: 'cpp-20-excepciones-hilos', terms: ['try', 'catch', 'std::thread', 'mutex'] },
		{ module: 'M8. Rendimiento', topic: 'Complejidad, cache, profiling y optimización', lesson: 'cpp-21-rendimiento', terms: ['complejidad', 'cache', 'profiling'] },
		{ module: 'M8. Rendimiento', topic: 'Paralelismo, OpenMP y SIMD', lesson: 'cpp-22-simd', terms: ['openmp', 'simd', 'paralel'] },
		{ module: 'M8. Rendimiento', topic: 'Grandes volúmenes de datos y memoria', lesson: 'cpp-22-simd', terms: ['memoria', 'grandes'] },
		{ module: 'M9. IA', topic: 'Eigen y álgebra lineal computacional', lesson: 'cpp-23-eigen', terms: ['eigen', 'matrix', 'vector'] },
		{ module: 'M9. IA', topic: 'ML desde cero y gradiente descendente', lesson: 'cpp-24-ml-desde-cero', terms: ['gradiente', 'mse', 'regresi'] },
		{ module: 'M9. IA', topic: 'pybind11 e interoperabilidad con Python', lesson: 'cpp-25-pybind11', terms: ['pybind11', 'módulo', 'python'] },
		{ module: 'M10. Proyectos', topic: 'Estructuras de datos y motor matricial', lesson: 'cpp-26-proyecto-matricial', terms: ['matrix', 'multiplicaci', 'cmake'] },
		{ module: 'M10. Proyectos', topic: 'Servidor de inferencia y despliegue', lesson: 'cpp-27-proyecto-inferencia', terms: ['inferencia', 'http', 'docker'] }
	]
};

const normalize = (value) =>
	String(value)
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');

function lessonText(lesson) {
	return normalize(JSON.stringify(lesson.blocks) + ' ' + (lesson.keywords ?? []).join(' '));
}

const results = {};

for (const [track, topics] of Object.entries(TOPICS)) {
	results[track] = topics.map((topic) => {
		const file = path.join(CONTENT, track, `${topic.lesson}.json`);
		if (!fs.existsSync(file)) {
			return { ...topic, status: 'pendiente', missing: [] };
		}
		const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
		const text = lessonText(lesson);
		const missing = topic.terms.filter((term) => !text.includes(normalize(term)));
		return { ...topic, status: missing.length ? 'revisar' : 'ok', missing };
	});
}

for (const [track, items] of Object.entries(results)) {
	const ok = items.filter((item) => item.status === 'ok').length;
	console.log(`\n${track.toUpperCase()} — ${ok}/${items.length} temas verificados`);
	console.log('─'.repeat(70));
	for (const item of items) {
		const icon = item.status === 'ok' ? '✓' : item.status === 'pendiente' ? '·' : '!';
		const extra = item.status === 'revisar' ? `  → faltan: ${item.missing.join(', ')}` : '';
		console.log(`${icon} ${item.topic}${extra}`);
	}
}

const all = Object.values(results).flat();
const summary = {
	ok: all.filter((item) => item.status === 'ok').length,
	revisar: all.filter((item) => item.status === 'revisar').length,
	pendiente: all.filter((item) => item.status === 'pendiente').length
};

console.log('\n' + '='.repeat(70));
console.log(`Cobertura: ${summary.ok}/${all.length} OK · ${summary.revisar} por revisar · ${summary.pendiente} pendientes`);

if (WRITE) {
	const lines = [
		'# Cobertura temática de AulaML',
		'',
		'> Generado por `node scripts/audit-topics.mjs --write`.',
		'> `OK` = la lección existe y contiene los conceptos clave; `revisar` = falta algún término;',
		'> `pendiente` = la lección aún no está escrita.',
		'',
		`**Resumen:** ${summary.ok} temas OK · ${summary.revisar} por revisar · ${summary.pendiente} pendientes de ${all.length}.`,
		''
	];
	for (const [track, items] of Object.entries(results)) {
		lines.push(`## ${track === 'python' ? 'Python' : 'C++'}`, '', '| Módulo | Tema | Lección | Estado |', '|---|---|---|---|');
		for (const item of items) {
			const state = item.status === 'ok' ? 'OK' : item.status === 'pendiente' ? 'Pendiente' : `Revisar (${item.missing.join(', ')})`;
			lines.push(`| ${item.module} | ${item.topic} | \`${item.lesson}\` | ${state} |`);
		}
		lines.push('');
	}
	fs.mkdirSync('docs', { recursive: true });
	fs.writeFileSync('docs/COBERTURA.md', lines.join('\n'));
	console.log('Escrito docs/COBERTURA.md');
}

if (summary.pendiente) process.exit(1);
