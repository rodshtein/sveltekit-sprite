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

    async closeBundle() {
      writeFileSync('src/app.html', appTemplate)
    }
  }
}

export { sveltekitSprite }
