import { sveltekit } from '@sveltejs/kit/vite';
import { sveltekitSprite } from 'sveltekit-sprite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekitSprite(),
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
};

export default config;
