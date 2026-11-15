#!/usr/bin/env node
/**
 * Compila los ejemplos C++ autocontenidos (con #include y main) de todas las lecciones.
 * Uso: node scripts/verify-cpp.mjs [--solo=<id>]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve('src/lib/content/cpp');
const onlyArg = process.argv.slice(2).find((arg) => arg.startsWith('--solo='));
const only = onlyArg ? onlyArg.split('=')[1] : null;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aulaml-cpp-'));

const files = fs.readdirSync(ROOT).filter((file) => file.endsWith('.json'));
let compiled = 0;
let failed = 0;
let skipped = 0;

function check(id, label, code) {
	if (!code || !/#include/.test(code) || !/\bmain\s*\(/.test(code)) return;
	// Ejemplos multarchivo: dependen de headers propios de la lección.
	if (/#include\s+"/.test(code)) {
		skipped++;
		return;
	}
	// Dependencias externas que no se instalan en este proyecto.
	if (/#include\s*<(Eigen|pybind11|httplib|nlohmann|torch|omp|opencv|cuda|sycl)[^>]*>/.test(code)) {
		skipped++;
		return;
	}
	// OpenMP necesita un runtime que clang de macOS no trae por defecto.
	if (/#pragma\s+omp/.test(code)) {
		skipped++;
		return;
	}
	// std::execution::par requiere una implementación de TBB.
	if (/std::execution::(par|par_unseq)/.test(code)) {
		skipped++;
		return;
	}
	compiled++;
	const source = path.join(tmp, `${id}-${compiled}.cpp`);
	fs.writeFileSync(source, code);
	const run = spawnSync('g++', ['-std=c++20', '-Wall', '-Wextra', '-fsyntax-only', source], {
		encoding: 'utf8',
		timeout: 20000
	});
	if (run.status !== 0) {
		failed++;
		const error = (run.stderr || '').split('\n').filter(Boolean).slice(0, 3).join('\n   ');
		console.log(`✗ ${id} · ${label}\n   ${error}`);
	}
}

for (const file of files) {
	const lesson = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
	if (only && lesson.id !== only) continue;

	lesson.blocks.forEach((block, index) => {
		if (block.type === 'code') check(lesson.id, `code ${index}`, block.code);
		if (block.type === 'trace') check(lesson.id, `trace ${index}`, block.code);
		if (block.type === 'compare') check(lesson.id, `compare ${index}`, block.cpp?.code);
		if (block.type === 'exercise') check(lesson.id, `exercise ${index}`, block.solution?.code);
		if (block.type === 'diff') check(lesson.id, `diff right ${index}`, block.right?.code);
	});
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\nEjemplos C++ autocontenidos compilados: ${compiled} · fallidos: ${failed} · omitidos: ${skipped}`);
if (failed) process.exit(1);
