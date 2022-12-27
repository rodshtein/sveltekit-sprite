import { sveltekit } from '@sveltejs/kit/vite';
import sveltekitSprite from 'sveltekit-sprite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekitSprite({
			svgSource: 'src/lib/sprite.svg',
			svgoOptions: {
				plugins: [
					{
						name: 'preset-default',
						params: {
							overrides: {
								cleanupIDs: false
							}
						}
					}
				]
			}
		}),
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
};

export default config;
