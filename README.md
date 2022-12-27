# SvelteKit Sprite Plugin

The plugin inline SVG into SvelteKit app template


**install:** `npm install -D svetekit-sprite`   


**config example**

```
📄 vite.config.js

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
};

...
```

```
📄 app.html

<body data-sveltekit-preload-data="hover">
  %vite.plugin.sprite%
  <div style="display: contents">%sveltekit.body%</div>
</body>
```
details & more - soon…
