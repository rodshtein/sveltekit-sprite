import { writeFileSync, readFileSync } from 'fs'
import { Plugin } from 'vite'
import { compiler } from './compiler'
import type { Options } from './types'

function sveltekitSprite({
  injectLabel = '%vite.plugin.sprite%',
  svgSource,
  symbolPrefix,
  stylePrefix,
  svgoOptions,
}: Options = {}): Plugin {
  const appTemplate:string = readFileSync('src/app.html', 'utf-8');
  const closeBundle = async () => {
    writeFileSync("src/app.html", appTemplate);
  };

  process.on('SIGINT', async () => {
    await closeBundle();
    process.exit(0);
  });
  
  return {
    name: 'sveltekit-sprite',
    async buildStart() {
      const filesString = await compiler({
        svgSource,
        symbolPrefix,
        stylePrefix,
        svgoOptions,
      });
      
      writeFileSync('src/app.html', appTemplate.replace(injectLabel, filesString))
    },
    closeBundle
  }
}

export { sveltekitSprite }
