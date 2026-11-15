import type { Curriculum, Lesson, ResolvedModule, ResolvedTrack, TrackId } from './types';
import curriculumJson from './data/curriculum.json';

const curriculum = curriculumJson as Curriculum;

const modules = import.meta.glob('./content/**/*.json', {
	eager: true,
	import: 'default'
}) as Record<string, Lesson>;

export const allLessons: Lesson[] = Object.values(modules)
	.filter((lesson) => lesson && typeof lesson.id === 'string')
	.sort((a, b) => (a.track === b.track ? a.order - b.order : a.track.localeCompare(b.track)));

export const lessonById = new Map<string, Lesson>(allLessons.map((lesson) => [lesson.id, lesson]));

export const moduleTitleByLesson = new Map<string, string>();
export const moduleIdByLesson = new Map<string, string>();

/** Orden plano por curso, con módulos resueltos. */
export const tracks: ResolvedTrack[] = curriculum.tracks.map((track) => {
	const resolvedModules: ResolvedModule[] = track.modules.map((mod, index) => {
		const lessonsData = mod.lessons
			.map((id) => {
				const lesson = lessonById.get(id);
				if (!lesson) {
					console.warn(`[AulaML] Lección referenciada pero no encontrada: ${id}`);
					return null;
				}
				moduleTitleByLesson.set(id, mod.title);
				moduleIdByLesson.set(id, mod.id);
				return lesson;
			})
			.filter((lesson): lesson is Lesson => lesson !== null);

		return { ...mod, lessonsData, index };
	});

	return {
		...track,
		modules: resolvedModules,
		flatLessons: resolvedModules.flatMap((mod) => mod.lessonsData)
	};
});

export const trackById = new Map<TrackId, ResolvedTrack>(
	tracks.map((track) => [track.id, track])
);

export const trackSlug = (track: TrackId) => track;
export const lessonHref = (lesson: Lesson) => `/${lesson.track}/${lesson.id}`;

export function getTrack(id: string): ResolvedTrack | undefined {
	return trackById.get(id as TrackId);
}

export function getLesson(track: string, slug: string): Lesson | undefined {
	const lesson = lessonById.get(slug);
	return lesson && lesson.track === track ? lesson : undefined;
}

export function getNeighbors(lesson: Lesson): { prev?: Lesson; next?: Lesson; module?: string } {
	const track = trackById.get(lesson.track);
	if (!track) return {};
	const index = track.flatLessons.findIndex((item) => item.id === lesson.id);
	return {
		prev: index > 0 ? track.flatLessons[index - 1] : undefined,
		next: index >= 0 && index < track.flatLessons.length - 1 ? track.flatLessons[index + 1] : undefined,
		module: moduleTitleByLesson.get(lesson.id)
	};
}

export function getModuleLessons(lesson: Lesson): Lesson[] {
	const moduleId = moduleIdByLesson.get(lesson.id);
	const track = trackById.get(lesson.track);
	if (!track || !moduleId) return [];
	return track.modules.find((mod) => mod.id === moduleId)?.lessonsData ?? [];
}

export function lessonsForTrack(id: TrackId): Lesson[] {
	return trackById.get(id)?.flatLessons ?? [];
}

export const stats = {
	lessons: allLessons.length,
	modules: curriculum.tracks.reduce((total, track) => total + track.modules.length, 0),
	tracks: curriculum.tracks.length,
	minutes: allLessons.reduce((total, lesson) => total + (lesson.minutes || 0), 0),
	quizzes: allLessons.reduce(
		(total, lesson) => total + lesson.blocks.filter((block) => block.type === 'quiz').length,
		0
	),
	exercises: allLessons.reduce(
		(total, lesson) => total + lesson.blocks.filter((block) => block.type === 'exercise').length,
		0
	)
};

export { curriculum };
