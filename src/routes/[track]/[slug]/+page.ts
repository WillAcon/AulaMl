import { allLessons } from '$lib/data';

export const entries = () => allLessons.map((lesson) => ({ track: lesson.track, slug: lesson.id }));
