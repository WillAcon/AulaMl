import { escapeHtml } from './md';

const COMMON = new Set([
	'true',
	'false',
	'nullptr',
	'NULL',
	'return',
	'if',
	'else',
	'for',
	'while',
	'do',
	'switch',
	'case',
	'default',
	'break',
	'continue',
	'void',
	'const',
	'static',
	'sizeof',
	'new',
	'delete',
	'this',
	'struct',
	'class',
	'enum',
	'typedef',
	'using',
	'namespace',
	'public',
	'private',
	'protected',
	'virtual',
	'override',
	'final',
	'template',
	'typename',
	'auto',
	'operator',
	'try',
	'catch',
	'throw',
	'noexcept',
	'explicit',
	'inline',
	'constexpr',
	'consteval',
	'nullptr_t',
	'mutable',
	'friend',
	'static_cast',
	'dynamic_cast',
	'reinterpret_cast',
	'const_cast',
	'co_await',
	'co_return',
	'co_yield'
]);

const CPP_TYPES = new Set([
	'int',
	'double',
	'float',
	'char',
	'bool',
	'long',
	'short',
	'unsigned',
	'signed',
	'byte',
	'wchar_t',
	'char8_t',
	'char16_t',
	'char32_t',
	'std',
	'string',
	'vector',
	'map',
	'unordered_map',
	'set',
	'unordered_set',
	'pair',
	'tuple',
	'array',
	'deque',
	'list',
	'queue',
	'stack',
	'priority_queue',
	'optional',
	'variant',
	'shared_ptr',
	'unique_ptr',
	'weak_ptr',
	'make_unique',
	'make_shared',
	'thread',
	'mutex',
	'lock_guard',
	'function',
	'istream',
	'ostream',
	'stringstream',
	'ifstream',
	'ofstream',
	'cout',
	'cin',
	'cerr',
	'endl',
	'stdout',
	'stderr'
]);

const PY_BUILTINS = new Set([
	'print',
	'len',
	'range',
	'int',
	'float',
	'str',
	'bool',
	'list',
	'tuple',
	'dict',
	'set',
	'frozenset',
	'type',
	'isinstance',
	'issubclass',
	'open',
	'input',
	'sum',
	'min',
	'max',
	'abs',
	'round',
	'sorted',
	'reversed',
	'enumerate',
	'zip',
	'map',
	'filter',
	'reduce',
	'any',
	'all',
	'next',
	'iter',
	'super',
	'object',
	'Exception',
	'ValueError',
	'TypeError',
	'KeyError',
	'IndexError',
	'RuntimeError',
	'StopIteration',
	'ZeroDivisionError',
	'FilePathError',
	'property',
	'staticmethod',
	'classmethod',
	'dataclass',
	'field',
	'Optional',
	'List',
	'Dict',
	'Tuple',
	'Set',
	'Union',
	'Callable',
	'Sequence',
	'Iterable',
	'Any',
	'Literal',
	'overload'
]);

const PY_KEYWORDS = new Set([
	'False',
	'None',
	'True',
	'and',
	'as',
	'assert',
	'async',
	'await',
	'break',
	'class',
	'continue',
	'def',
	'del',
	'elif',
	'else',
	'except',
	'finally',
	'for',
	'from',
	'global',
	'if',
	'import',
	'in',
	'is',
	'lambda',
	'nonlocal',
	'not',
	'or',
	'pass',
	'raise',
	'return',
	'try',
	'while',
	'with',
	'yield',
	'match',
	'case',
	'self',
	'cls'
]);

/**
 * Resaltador ligero, sin dependencias. Devuelve HTML seguro.
 * No pretende ser un parser: prioriza comentarios, strings, números y palabras clave.
 */
export function highlight(code: string, lang = 'python'): string {
	const isPy = lang === 'python' || lang === 'py';
	const keywords = isPy ? PY_KEYWORDS : COMMON;
	const known = isPy ? PY_BUILTINS : CPP_TYPES;
	const commentRe = isPy ? /#[^\n]*/ : /\/\/[^\n]*|\/\*[\s\S]*?\*\//;
	const preproc = !isPy;
	const re = new RegExp(
		[
			'(' + commentRe.source + ')',
			'("""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\')',
			'(\\b0[xX][0-9a-fA-F]+\\b|\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)',
			'([A-Za-z_]\\w*)(?=\\s*\\()',
			'([A-Za-z_]\\w*)'
		].join('|'),
		'g'
	);

	let out = '';
	let last = 0;
	for (const match of code.matchAll(re)) {
		const [whole, comment, str, num, fn, word] = match;
		const at = match.index ?? 0;
		out += escapeHtml(code.slice(last, at));
		last = at + whole.length;

		if (comment) {
			out += `<span class="tk-com">${escapeHtml(comment)}</span>`;
		} else if (str) {
			out += `<span class="tk-str">${escapeHtml(str)}</span>`;
		} else if (num) {
			out += `<span class="tk-num">${escapeHtml(num)}</span>`;
		} else if (fn) {
			if (keywords.has(fn)) out += `<span class="tk-kw">${escapeHtml(fn)}</span>`;
			else if (known.has(fn)) out += `<span class="tk-bi">${escapeHtml(fn)}</span>`;
			else out += `<span class="tk-fn">${escapeHtml(fn)}</span>`;
		} else if (word) {
			if (keywords.has(word)) out += `<span class="tk-kw">${escapeHtml(word)}</span>`;
			else if (known.has(word)) out += `<span class="tk-bi">${escapeHtml(word)}</span>`;
			else if (preproc && word === 'include') out += `<span class="tk-kw">${escapeHtml(word)}</span>`;
			else out += escapeHtml(word);
		} else {
			out += escapeHtml(whole);
		}
	}
	out += escapeHtml(code.slice(last));
	return out;
}
