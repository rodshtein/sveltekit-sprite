# SvelteKit Sprite Plugin

The plugin compiles svg files into a sprite and inline as string to the app template.<br>
- Sprite with symbols from svg files
- Uniq id links in symbols
- Uniq id's for all symbols
- Folder based id's
- Sprite as string in app.html
- SVGO for sprite optimization<br>
<br>

## Roadmap
☑︎  Build sprite from folder<br>
☑︎  Style id encapsulating<br>
□  Build sprite from files array<br>
□  Error handling<br>
□  File watcher<br>
□  Save sprite to file<br>
□  Unwrap symbols from file in folder<br>
□  Add svg's from @import<br>
<br>

## Get started

**1. Install the plugin**<br>
Run `npm i -D sveltekit-sprite` command.<br>

**2. Edit Vite config**<br>
Import and configure the plugin in the `vite.config.js` file:<br>

```diff 
  import { sveltekit } from '@sveltejs/kit/vite';
+ import { sveltekitSprite } from 'sveltekit-sprite';

  /** @type {import('vite').UserConfig} */
  const config = {
    plugins: [
+   sveltekitSprite({…option here}),
      sveltekit()
    ],
  };
```
<br>

**3. Add label to app template**<br>
In `app.html` add label `%vite.plugin.sprite%` to point Vite where to inline the svg sprite.<br>
You can change label by [injectLabel](#injectlabel) option.<br>
```diff
  <body data-sveltekit-preload-data="hover">
+   %vite.plugin.sprite%
    <div style="display: contents">%sveltekit.body%</div>
  </body>
```
<br>

**4. Put your svg files to `./src/lib/sprite/`**<br>
You can change sprite folder by [svgSource](#svgsource) option.
<br>

**5. Run app `npm run dev`**<br>
⚠️ For now sprite will compile once on start app in dev mode or on build. If you want add more symbols to sprite → restart the app.
<br>

**6. Add link to the specific symbol on your page**<br>
Symbols id's will begin with the prefix `svg--[subfolder]-[file-name]`<br>
You can change symbol prefix by [symbolPrefix](#symbolprefix) option.
```html
<svg>
  <use xlink:href="#svg--icon" />
</svg>
```
<br>

## Options
Default option are presented. 
### svgoOptions
See SVGO config info on [official repo](https://github.com/svg/svgo)<br>
Additional option `presetDefault` for disable [default plugins](https://github.com/svg/svgo#default-preset)<br>
<br>
⚠️ If you pass your own `presetDefault` preset, Svelte-sprite will disable the cleanupIDs option and add the `removeViewBox: false` option to build the sprite from folder.

⚠️ `prefixIds` option is always on for build a sprite from a folder with the: `prefix` option, you can't override it.
<br>

```javascript 
sveltekitSprite({
  svgoOptions: {
    presetDefault: true,
    ... other option here
  },
}),
```
<br>

### svgSource
You can use it in two ways:<br>
<br>
**Path to ready sprite file**<br>
On this mode you can optimize your sprite by SVGO options. The symbols id will leave as they are.<br>
  
**Path to folder with svg's files (from project root)**<br>
On this mode sprite folder structure represent symbols id as folders router in SveleKit represent addresses of app.<br>
For example: `/sprite/icons/star.svg` → become → `#svg--icons-star`

```javascript 
sveltekitSprite({
  svgSource: 'src/lib/sprite',
}),
```
<br>

### symbolPrefix
From the prefix begin all id of symbols: `[symbolPrefix]--[subfolder]-[file-name]` 
```javascript 
sveltekitSprite({
  symbolPrefix: 'svg',
}),
```
<br>

### stylePrefix
All id's in the svg files will be replaced by he prefix and file name: `[stylePrefix]--[subfolder]-[file-name]`

```javascript 
sveltekitSprite({
  stylePrefix: 'svg-style',
}),
```
<br>

### injectLabel
Label in the app.html template to place the sprite string. <br>

```javascript 
sveltekitSprite({
  injectLabel: '%vite.plugin.sprite%',
}),
```
