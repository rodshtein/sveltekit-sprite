import type {  OptimizeOptions } from 'svgo'

export interface Options {
  /**
   * [SVGO](https://github.com/svg/svgo) options
   */
  svgoOptions?:OptimizeOptions & {
    /**
     * Enable default SVGO preset
     * Default: true
     */
    presetDefault?:boolean
  }

  /**
   *  Path folder with svg files
   *  Subfolders are supported
   *  ~or~
   *  Path to already sprite file with symbols 
   */
  svgSource?:string

  /**
   * Prefix for symbols id
   * Default: svg 
   */
  symbolPrefix?:string
  
  /**
   * Prefix for styles id
   * Default: svg-style
   */
  stylePrefix?:string

  /**
   * Path for generated svg sprite
   * Default: src/lib/sveltekit-sprite.svg
   */
  outputFile?:string
}
