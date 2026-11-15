/**
 * Ejecución opcional de Python en el navegador con Pyodide.
 * Se descarga bajo demanda (solo al pulsar «Probar»), nunca bloquea el sitio.
 */

const VERSION = '314.0.8';
const CDN = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;

let promise: Promise<PyodideLike> | null = null;
const dynamicImport = new Function('url', 'return import(url)') as (
	url: string
) => Promise<Record<string, unknown>>;

export interface PyodideLike {
	runPythonAsync: (code: string, options?: Record<string, unknown>) => Promise<unknown>;
	setStdout: (options: { batched: (text: string) => void }) => void;
	setStderr: (options: { batched: (text: string) => void }) => void;
	setStdin: (options: { stdin: () => string }) => void;
}

export async function loadPyodide(onProgress?: (message: string) => void): Promise<PyodideLike> {
	if (promise) return promise;
	promise = (async () => {
		onProgress?.('Descargando el intérprete de Python (unos 12 MB)…');
		const mod = await dynamicImport(CDN + 'pyodide.mjs');
		onProgress?.('Iniciando el intérprete…');
		const loader = mod.loadPyodide as (options: { indexURL: string }) => Promise<PyodideLike>;
		return await loader({ indexURL: CDN });
	})().catch((error) => {
		promise = null;
		throw error;
	});
	return promise;
}

export interface RunResult {
	output: string;
	error?: string;
	ms: number;
}

export async function runPython(
	code: string,
	onProgress?: (message: string) => void
): Promise<RunResult> {
	const started = performance.now();
	const py = await loadPyodide(onProgress);
	const chunks: string[] = [];

	py.setStdout({ batched: (text) => chunks.push(text + '\n') });
	py.setStderr({ batched: (text) => chunks.push(text + '\n') });
	py.setStdin({
		stdin: () => globalThis.prompt('El programa pide una entrada (input):') ?? ''
	});

	try {
		const result = await py.runPythonAsync(code);
		if (result !== undefined && result !== null) {
			const text = String(result);
			if (text && text !== 'None') chunks.push(`Out: ${text}\n`);
		}
		return { output: chunks.join(''), ms: Math.round(performance.now() - started) };
	} catch (error) {
		return {
			output: chunks.join(''),
			error: error instanceof Error ? error.message : String(error),
			ms: Math.round(performance.now() - started)
		};
	}
}
