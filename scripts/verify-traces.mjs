#!/usr/bin/env node
/**
 * Verifica que las trazas de Python coincidan con la ejecución real.
 * Ejecuta cada bloque `trace` con python3 y compara la salida acumulada de los pasos.
 * Uso: node scripts/verify-traces.mjs [--solo=<id>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve('src/lib/content/python');
const onlyArg = process.argv.slice(2).find((arg) => arg.startsWith('--solo='));
const only = onlyArg ? onlyArg.split('=')[1] : null;

const files = fs
	.readdirSync(ROOT)
	.filter((file) => file.endsWith('.json'))
	.map((file) => path.join(ROOT, file));

let checked = 0;
let failed = 0;
let skipped = 0;

for (const file of files) {
	const lesson = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (only && lesson.id !== only) continue;

	lesson.blocks.forEach((block, index) => {
		if (block.type !== 'trace' || (block.lang && block.lang !== 'python')) return;
		const label = `${lesson.id} · traza ${index}`;
		const expected = block.steps.map((step) => step.output ?? '').join('');

		// Trazas ilustrativas de frameworks (async/middleware) no son ejecutables aisladas.
		if (/\basync def\b|\bcall_next\b|FastAPI|TestClient/.test(block.code)) {
			skipped++;
			console.log(`↷ ${label}: omitida (traza ilustrativa de framework)`);
			return;
		}

		const run = spawnSync('python3', ['-c', block.code], {
			encoding: 'utf8',
			timeout: 5000,
			stdio: ['ignore', 'pipe', 'pipe']
		});
		const stderr = String(run.stderr ?? '');
		if (run.status !== 0) {
			if (/ModuleNotFoundError|ImportError|EOFError/.test(stderr)) {
				skipped++;
				console.log(`↷ ${label}: omitida (${stderr.split('\n')[0]})`);
			} else {
				failed++;
				console.log(`✗ ${label}: el código no ejecuta\n   ${stderr.split('\n')[0]}`);
			}
			return;
		}

		checked++;
		const stdout = String(run.stdout ?? '');
		const clean = (value) => value.replace(/\r\n/g, '\n').replace(/\s+$/g, '');
		const expectedClean = clean(expected);
		const candidates = [clean(stdout), clean(stderr), clean(stdout + stderr)];
		const actualClean = candidates.find((value) => value.length > 0) ?? '';

		const lastLine = block.steps.at(-1)?.line ?? 0;
		const totalLines = block.code.split('\n').length;
		const complete = lastLine >= totalLines;

		const matches = (value) => (complete ? expectedClean === value : value.startsWith(expectedClean));
		const ok = candidates.some(matches);

		if (!ok) {
			failed++;
			console.log(`✗ ${label}: la salida de los pasos no coincide`);
			console.log(`   esperado: ${JSON.stringify(expectedClean.slice(0, 160))}`);
			console.log(`   real    : ${JSON.stringify(actualClean.slice(0, 160))}`);
		}
	});
}

console.log(`\nTrazas verificadas: ${checked} · fallidas: ${failed} · omitidas: ${skipped}`);
if (failed) process.exit(1);
