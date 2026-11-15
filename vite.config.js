import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import path from 'node:path';

export default defineConfig({
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	},
	plugins: [
		sveltekit({
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: undefined,
				precompress: false,
				strict: true
			}),
			prerender: {
				entries: ['*'],
				handleHttpError: 'fail'
			}
		})
	],
	server: {
		watch: {
			ignored: ['**/build/**', '**/.svelte-kit/**']
		}
	}
});
