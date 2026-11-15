export type TrackId = 'python' | 'cpp';
export type Level = 'principiante' | 'intermedio' | 'avanzado';

export interface CodeSample {
	lang?: string;
	code: string;
	caption?: string;
}

export interface TraceStep {
	line: number;
	note?: string;
	vars?: Record<string, string>;
	output?: string;
	frames?: { name: string; vars: Record<string, string> }[];
}

export interface MemCell {
	name: string;
	value: string;
	addr?: string;
	type?: string;
}

export interface MemoryStep {
	note?: string;
	stack?: MemCell[];
	heap?: MemCell[];
	arrows?: { from: string; to: string; label?: string }[];
	highlight?: string[];
}

export interface MatrixStep {
	note?: string;
	data?: number[][];
	highlight?: [number, number][];
}

export type Tone = 'info' | 'tip' | 'warn' | 'danger' | 'success';

export type Block =
	| { type: 'p'; md: string }
	| { type: 'h'; text: string }
	| { type: 'code'; lang?: string; code: string; caption?: string; highlight?: number[] }
	| { type: 'list'; ordered?: boolean; items: string[] }
	| { type: 'table'; head: string[]; rows: string[][]; caption?: string }
	| { type: 'callout'; tone?: Tone; title?: string; md: string }
	| {
			type: 'compare';
			title?: string;
			python: CodeSample;
			cpp: CodeSample;
			note?: string;
	  }
	| {
			type: 'diff';
			title?: string;
			wrong: CodeSample;
			right: CodeSample;
			explain?: string;
	  }
	| { type: 'trace'; lang?: string; code: string; caption?: string; steps: TraceStep[] }
	| {
			type: 'slice';
			title?: string;
			string: string;
			start?: number;
			stop?: number;
			step?: number;
			note?: string;
	  }
	| {
			type: 'memory';
			title?: string;
			lang?: string;
			code?: string;
			steps: MemoryStep[];
	  }
	| {
			type: 'matrix';
			title?: string;
			data: number[][];
			rowLabels?: string[];
			colLabels?: string[];
			steps?: MatrixStep[];
	  }
	| {
			type: 'quiz';
			question: string;
			options: string[];
			answer: number;
			explain?: string;
	  }
	| {
			type: 'fill';
			title?: string;
			lang?: string;
			code: string;
			answers: string[];
			hint?: string;
			explain?: string;
	  }
	| {
			type: 'exercise';
			title: string;
			md: string;
			hint?: string;
			solution: CodeSample & { explain?: string };
	  }
	| { type: 'links'; title?: string; items: { label: string; url: string; note?: string }[] };

export interface Lesson {
	id: string;
	track: TrackId;
	order: number;
	module?: string;
	title: string;
	subtitle?: string;
	level: Level;
	minutes: number;
	tags?: string[];
	keywords?: string[];
	summary?: string;
	objectives?: string[];
	prerequisites?: string[];
	blocks: Block[];
}

export interface ModuleDef {
	id: string;
	title: string;
	description?: string;
	lessons: string[];
}

export interface TrackDef {
	id: TrackId;
	name: string;
	short: string;
	tagline: string;
	description: string;
	modules: ModuleDef[];
}

export interface Curriculum {
	tracks: TrackDef[];
}

export interface ResolvedModule extends ModuleDef {
	lessonsData: Lesson[];
	index: number;
}

export interface ResolvedTrack extends Omit<TrackDef, 'modules'> {
	modules: ResolvedModule[];
	flatLessons: Lesson[];
}

export interface SearchSection {
	id: string;
	heading: string;
	text: string;
}

export interface SearchDoc {
	id: string;
	track: TrackId;
	title: string;
	subtitle: string;
	module: string;
	level: Level;
	tags: string[];
	keywords: string[];
	summary: string;
	sections: SearchSection[];
	all: string;
}

export interface SearchHit {
	doc: SearchDoc;
	score: number;
	sectionId?: string;
	snippet: string;
	matched: string[];
}
