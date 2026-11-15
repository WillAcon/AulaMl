import { browser } from '$app/env';

const KEY = 'aulaml.v1';
const THEME_KEY = 'aulaml.theme';

export type Theme = 'dark' | 'light';

interface ProgressState {
	done: Record<string, number>;
	fav: string[];
	last: string | null;
	notes: Record<string, string>;
	quiz: Record<string, number>;
	theme: Theme;
}

const EMPTY: ProgressState = {
	done: {},
	fav: [],
	last: null,
	notes: {},
	quiz: {},
	theme: 'dark'
};

function readServerSafe(): ProgressState {
	if (!browser) return { ...EMPTY };
	try {
		const raw = localStorage.getItem(KEY);
		const theme = localStorage.getItem(THEME_KEY);
		const parsed = raw ? (JSON.parse(raw) as Partial<ProgressState>) : {};
		return {
			...EMPTY,
			...parsed,
			done: parsed.done ?? {},
			fav: Array.isArray(parsed.fav) ? parsed.fav : [],
			notes: parsed.notes ?? {},
			quiz: parsed.quiz ?? {},
			theme: theme === 'light' || theme === 'dark' ? theme : parsed.theme === 'light' ? 'light' : 'dark'
		};
	} catch {
		return { ...EMPTY };
	}
}

class ProgressStore {
	state = $state<ProgressState>(readServerSafe());
	hydrated = $state(false);

	constructor() {
		if (browser) {
			this.applyTheme();
		}
	}

	private persist() {
		if (!browser) return;
		try {
			localStorage.setItem(KEY, JSON.stringify(this.state));
			localStorage.setItem(THEME_KEY, this.state.theme);
		} catch {
			/* almacenamiento lleno o bloqueado */
		}
	}

	private applyTheme() {
		if (!browser) return;
		document.documentElement.dataset.theme = this.state.theme;
	}

	toggleTheme() {
		this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
		this.applyTheme();
		this.persist();
	}

	isDone(id: string): boolean {
		return Boolean(this.state.done[id]);
	}

	setDone(id: string, value: boolean) {
		if (value) this.state.done[id] = Date.now();
		else delete this.state.done[id];
		this.persist();
	}

	toggleDone(id: string) {
		this.setDone(id, !this.isDone(id));
		return this.isDone(id);
	}

	isFav(id: string): boolean {
		return this.state.fav.includes(id);
	}

	toggleFav(id: string) {
		const index = this.state.fav.indexOf(id);
		if (index >= 0) this.state.fav.splice(index, 1);
		else this.state.fav.push(id);
		this.persist();
		return this.isFav(id);
	}

	visit(id: string) {
		if (this.state.last === id) return;
		this.state.last = id;
		this.persist();
	}

	note(id: string): string {
		return this.state.notes[id] ?? '';
	}

	setNote(id: string, text: string) {
		this.state.notes[id] = text;
		this.persist();
	}

	quizAnswer(key: string): number | undefined {
		return this.state.quiz[key];
	}

	setQuizAnswer(key: string, index: number) {
		this.state.quiz[key] = index;
		this.persist();
	}

	clearQuizAnswer(key: string) {
		delete this.state.quiz[key];
		this.persist();
	}

	init() {
		if (!browser) return;
		const stored = readServerSafe();
		this.state.done = stored.done;
		this.state.fav = stored.fav;
		this.state.last = stored.last;
		this.state.notes = stored.notes;
		this.state.quiz = stored.quiz;
		this.state.theme = stored.theme;
		this.hydrated = true;
		this.applyTheme();
	}

	doneCount(ids: string[]): number {
		return ids.reduce((total, id) => total + (this.state.done[id] ? 1 : 0), 0);
	}

	percent(ids: string[]): number {
		if (!ids.length) return 0;
		return Math.round((this.doneCount(ids) / ids.length) * 100);
	}

	reset() {
		const theme = this.state.theme;
		this.state.done = {};
		this.state.fav = [];
		this.state.notes = {};
		this.state.quiz = {};
		this.state.last = null;
		this.state.theme = theme;
		this.persist();
	}
}

export const progress = new ProgressStore();
