import { tracks } from '$lib/data';

export const entries = () => tracks.map((track) => ({ track: track.id }));
