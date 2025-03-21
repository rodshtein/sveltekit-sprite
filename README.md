# SvelteKit Sprite Plugin

This plugin simplifies the process of using SVG sprites within your SvelteKit projects. It compiles your SVG files into a single sprite, optimizing them with SVGO, and injects the sprite directly into your application's HTML.

## Key Features

*   **SVG Sprite Generation:** Creates a single SVG sprite containing symbols derived from your source SVG files.
*   **Optimized with SVGO:** Applies SVGO (Scalable Vector Graphics Optimizer) to reduce file size and improve performance.  Includes options to customize optimization.
*   **Unique Symbol IDs:** Generates unique IDs for all symbols within the sprite, ensuring proper referencing.
*   **Folder-Based IDs:**  Supports folder-based organization of your SVG files, reflecting in the symbol IDs for easy referencing.
*   **Direct HTML Injection:**  Injects the generated sprite directly into your application's `app.html` file for streamlined integration.
*   **File Watcher:**  Watches for changes in your SVG source directory and automatically regenerates the sprite during development.
*   **Style Prefix:**  Replace all id's inside the svg files to be more specific to your project

## Roadmap (Completed features are marked)

- [x] Build sprite from folder
- [x] Style id encapsulating
- [x] Generate a single SVG sprite file.
- [x] Remove `injectLabel` option.
- [x] Add `outputFile` option.
- [x] Add watch for `svgSource` change.
- [x] Reload the page when the sprite file is generated.

- [ ] Build sprite from files array
- [ ] Error handling
- [ ] Save sprite to file
- [ ] Unwrap symbols from file in folder
- [ ] Add svg's from @import

## Get Started

**1. Install the Plugin:**

   Run the following command in your SvelteKit project:

   ```bash
   npm install -D sveltekit-sprite
   ```

**2. Configure Vite:**

   Import and configure the plugin in your `vite.config.js` file:

   ```javascript
   import { sveltekit } from '@sveltejs/kit/vite';
   import { sveltekitSprite } from 'sveltekit-sprite';

   /** @type {import('vite').UserConfig} */
   const config = {
     plugins: [
       sveltekit(),
       sveltekitSprite({
         // Options go here (see below)
       }),
     ],
   };

   export default config;
   ```

**3. Place SVG Files:**

   Place your SVG files within a designated source directory.  The default location is `src/lib/sprite`, but this can be customized using the [`svgSource`](#svgsource) option.

**4. Integrate the Sprite into Your App (using `hooks.server.ts`)**:

   To integrate the SVG sprite with your application you have to:

   *   **Add label to app template:**
        In `app.html` add label `%vite.plugin.sprite%` to point Vite where to inline the svg sprite.
        ```html
        <body data-sveltekit-preload-data="hover">
          %vite.plugin.sprite%
          <div style="display: contents">%sveltekit.body%</div>
        </body>
        ```
   *   **Create or update** `src/hooks.server.ts` file.

        ```ts
        import { sequence } from '@sveltejs/kit/hooks';
        import svgSprite from '$lib/sveltekit-sprite.svg?raw';

        const handleSvgSprite: Handle = async ({ event, resolve }) => {
          return resolve(event, {
            transformPageChunk: ({ html }) => html.replace('%vite.plugin.sprite%', svgSprite ?? '')
          });
        };

        export const handle: Handle = sequence(handleSvgSprite);
        ```

**5. Add Links to SVG Symbols:**

   Reference the specific symbols in your Svelte components using the following format:

   ```html
   <svg>
     <use xlink:href="#[symbolPrefix]--[subfolder]-[file-name]" />
   </svg>
   ```

   *   `[symbolPrefix]` is the value you set for the `symbolPrefix` option (defaults to `svg`).
   *   `[subfolder]` is the name of the subfolder (if any) where your SVG file is located within the `svgSource` directory.  Use empty string if no subfolders.
   *   `[file-name]` is the name of your SVG file (without the `.svg` extension).

   **Example:**

   If you have an SVG file named `star.svg` located in `src/lib/sprite/icons/`, and you're using the default `symbolPrefix`, the ID would be `#svg--icons-star`.

## Options

Here's a breakdown of the available options:

### `svgSource`

*   **Type:** `string`
*   **Default:** `'src/lib/sprite'`
*   **Description:** Specifies the directory where your SVG source files are located (relative to your project root). The plugin watches this folder for changes.

   ```javascript
   sveltekitSprite({
     svgSource: 'src/assets/svg',
   });
   ```

### `outputFile`

*   **Type:** `string`
*   **Default:** `'src/lib/sveltekit-sprite.svg'`
*   **Description:** Specifies the output file where the generated SVG sprite will be saved.  This file is then imported and used in your `hooks.server.ts` file, as shown in the [Get Started](#get-started) section.

   ```javascript
   sveltekitSprite({
     outputFile: 'static/sprite.svg', // Place in the static folder for direct access
   });
   ```

### `symbolPrefix`

*   **Type:** `string`
*   **Default:** `'svg'`
*   **Description:**  The prefix to be added to the beginning of each symbol ID in the sprite. This helps you uniquely identify your SVG symbols.

   ```javascript
   sveltekitSprite({
     symbolPrefix: 'icon',
   });
   ```
   **Usage in Svelte:**
   ```html
     <svg>
       <use xlink:href="#icon--icons-star" />
     </svg>
   ```

### `stylePrefix`

*   **Type:** `string`
*   **Default:** `'icon'`
*   **Description:**  The prefix to be added to all IDs inside the svg files to be more specific to your project.

   ```javascript
   sveltekitSprite({
     stylePrefix: 'icon-style',
   });
   ```

### `svgoOptions`

*   **Type:** `object`
*   **Default:** `{ presetDefault: true }`
*   **Description:**  Configuration options for the SVGO optimizer.  Refer to the [SVGO documentation](https://github.com/svg/svgo) for a comprehensive list of available options.

    *   `presetDefault`:  Enables or disables SVGO's default plugins.
    *   You can override default plugins.

   ```javascript
   sveltekitSprite({
     svgoOptions: {
       presetDefault: true, // or false to disable default plugins
       plugins: [
         { name: 'removeViewBox', active: false }, // Disable removeViewBox
         { name: 'removeAttrs', params: { attrs: ['fill', 'stroke'] } }, // Remove fill and stroke attributes
       ],
     },
   });
   ```
**⚠️ Important Notes about `svgoOptions`:**

*   If you set `presetDefault` to `false`, you'll typically want to specify the `plugins` option to configure the optimizations you want to apply.  Otherwise, no optimizations will occur.
*   For building the sprite from folder the plugin add  `removeViewBox: false` option.
*   `prefixIds` option is always on for build a sprite from a folder with the: `prefix` option, you can't override it.

## Usage in Svelte without SvelteKit (Not tested)

While primarily designed for SvelteKit, you can potentially integrate the sprite into a standard Svelte project (not tested):

1.  **Install the Plugin:** `npm install -D sveltekit-sprite`
2.  **Configure Vite:** Configure the plugin inside `vite.config.js`.
3.  **Import the Sprite:**
    ```svelte
    <script>
      import svgSprite from '$lib/sveltekit-sprite.svg?raw';
    </script>

    <div>{@html svgSprite}</div>
    ```
4.  **Add Links:** follow [5. Add Links to SVG Symbols:](#add-links-to-svg-symbols) section to implement symbols in your project
