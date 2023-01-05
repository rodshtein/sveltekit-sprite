# SvelteKit Sprite Plugin

The plugin compile svg files into a sprite and render to the app template  
- Sprite with symbols from svg files
- Uniq id links in symbols
- Uniq id's for all symbols
- Folder based id's
- Sprite as string in app.html
- SVGO for sprite optimization
## Roadmap
- [x] Build sprite from folder
- [x] Style id encapsulating
- [  ] Build sprite from files array
- [  ] Error handling 
- [  ] File watcher 
- [  ] Save sprite to file 
- [  ] Unwrap symbols from file in folder 
- [  ] Add svg's from @import 

## Get started

**1. Install plugin: `npm i -D sveltekit-sprite`**   
<br>

**2. Edit `vite.config.js` config**

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

**3. Add target label to `app.html`**<br>
You can change label by injectLabel option.<br>
```diff
  <body data-sveltekit-preload-data="hover">
+   %vite.plugin.sprite%
    <div style="display: contents">%sveltekit.body%</div>
  </body>
```
<br>

**4. Put your svg files to `./src/lib/sprite/`**<br>
You can change sprite folder by `svgSource` option.
<br>

**5. Run app `npm run dev`**<br>
⚠️ For now sprite will compile once on start app in dev mode or on build. If you want add more symbols to sprite → restart the app.
<br>

**6. Add link to the specific symbol on your page**<br>
Symbols id's will begin with the prefix `svg--[subfolder]-[file-name]`<br>
You can change symbol prefix by `symbolPrefix` option.
```html
<svg>
  <use xlink:href="#svg--icon" />
</svg>
```

## Options
Default option are presented
### svgoOptions
See SVGO config info on [official repo](https://github.com/svg/svgo)<br>
⚠️ Additional option `presetDefault` for disable [default plugins](https://github.com/svg/svgo#default-preset)

```javascript 
sveltekitSprite({
  svgoOptions: {
    presetDefault: true,
    ... other option here
  },
}),
```

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
### symbolPrefix
From the prefix begin all id of symbols:<br>
`[symbolPrefix]--[subfolder]-[file-name]` 
```javascript 
sveltekitSprite({
  symbolPrefix: 'svg',
}),
```
### stylePrefix
All id's in the svg files will be replaced by he prefix and file name:<br>
`[stylePrefix]--[subfolder]-[file-name]`

```javascript 
sveltekitSprite({
  stylePrefix: 'svg-style',
}),
```
### injectLabel
Label in the app.html template to place the sprite string<br>

```javascript 
sveltekitSprite({
  injectLabel: '%vite.plugin.sprite%',
}),
```