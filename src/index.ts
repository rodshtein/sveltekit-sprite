import { writeFileSync, readFileSync } from 'fs'
import { optimize, type OptimizedError, type OptimizeOptions } from 'svgo'
import { Plugin } from 'vite'

interface Options {
  /**
   * [SVGO](https://github.com/svg/svgo) options
   */
  svgoOptions?: OptimizeOptions | false

  /**
   *  Path to one file or array of path to svg 
   */
  svgSource?: string
}

const nodeWrapper = (sprite:string[]) => {
  return `<div style="border:0;clip:rect(0 0 0 0);height:auto;margin:0;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap">${sprite}</div>`
}

function isSvgoOptimizeError(obj: unknown): obj is OptimizedError {
  return typeof obj === 'object' && obj !== null && !('data' in obj)
}

function transformApp(options: Options): Plugin {
  let readySVG:any; 
  let appTemplate:string = readFileSync('src/app.html', 'utf-8');

  return {
    name: 'sveltekit-sprite',

    buildStart() {
      let filepath = options.svgSource

      if(!filepath) return
      
      let rawSVG:string = readFileSync(filepath, 'utf-8')
      
      readySVG = options.svgoOptions !== false
        ? optimize(rawSVG, { path: filepath, ...(options.svgoOptions || {})})
        : { rawSVG }
    
      if (isSvgoOptimizeError(readySVG)) {
        console.error('SVGO run error:', readySVG)
        return
      }

      
      writeFileSync('src/app.html', appTemplate.replace('%vite.plugin.sprite%', nodeWrapper(readySVG.data)))
    },

    closeBundle() {
      writeFileSync('src/app.html', appTemplate)
    }
  }
}

export = transformApp
