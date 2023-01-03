import type { Options } from './types'

import { 
  optimize, 
  type OptimizedError, 
  type OptimizeOptions
} from 'svgo';

import { readdir, readFile, lstat } from 'fs/promises';
import * as path from 'path';

export async function compiler(
  {
    svgSource = 'src/lib/sprite',
    symbolPrefix = 'svg',
    stylePrefix = 'svg-style',
    svgoOptions = {
      presetDefault:true
    },
  }:Options = {},
): Promise<string> {
  const spriteSrcType = await lstat(svgSource);
  const visuallyHidden = 'style="border:0;clip:rect(0 0 0 0);height:auto;margin:0;overflow:hidden;padding:0;position:absolute;width:1px;white-space:nowrap"';
  let spriteString:string = '';

  
  if(spriteSrcType.isDirectory()){

    let spriteFilesArray = await getSpriteFilesArray(svgSource)
    for (let {filePath, symbolId} of spriteFilesArray) {
      spriteString = spriteString + await getSymbol({filePath, symbolId, symbolPrefix, stylePrefix, svgoOptions})
    }

    // Visually-hidden styles for show defs styles in symbols
    return `<svg ${visuallyHidden}>${spriteString}</svg>`

  } else {
    // Rules for already sprite file
    spriteString = await optimizeSVG({
        filePath: svgSource, 
        symbolId: symbolPrefix, 
        stylePrefix,
        svgoOptions,
        singleFileSprite: true
        }
      )
    return spriteString.replace(/<svg.*?>/is, `<svg ${visuallyHidden}>`)
  }
}



export async function getSpriteFilesArray(filesPath:string, parentID?:string) {
  const files:string[] = await readdir(filesPath);
  let results:{ filePath:string, symbolId:string }[] = [];

  for (let file of files) {
    const fullPath = path.join(filesPath, file);
    const fileInfo = await lstat(fullPath);
    const fileExtname = path.extname(file)
    const fileName = path.basename(file, fileExtname);
    const currentID = parentID ? parentID + '-' + fileName : fileName;

    if(fileInfo.isDirectory()){
      const childFolder = await getSpriteFilesArray(fullPath, currentID);
      results = results.concat(childFolder)
    } else if(fileExtname === '.svg') {
      results.push({
        filePath: fullPath,
        symbolId: currentID,
      })
    }    
  }
  return results;
};



export async function getSymbol({ filePath, symbolId, symbolPrefix, stylePrefix, svgoOptions }:{
  filePath:string,
  symbolId:string,
  symbolPrefix: string,
  stylePrefix: string,
  svgoOptions:OptimizeOptions & {presetDefault?:boolean}
}):Promise<string>{
  
  const readySvgString = await optimizeSVG({ filePath, symbolId, stylePrefix, svgoOptions });

  const rules = {
    // Keep viewBox 
    // Replace svg -> symbol
    // Add symbol id
    regexp: /<svg.*?(viewBox.*?[',",`].*?[',",`]).*?>(.*?)<\/svg>/is, 
    string: `<symbol id="${symbolPrefix+'--'+symbolId}" $1>$2</symbol>`
  }

  return readySvgString.replace(rules.regexp, rules.string)
}



export async function optimizeSVG({
  filePath,
  symbolId,
  stylePrefix,
  svgoOptions,
  singleFileSprite = false
}:{
  filePath:string, 
  symbolId:string,
  stylePrefix:string,
  svgoOptions:OptimizeOptions & {presetDefault?:boolean},
  singleFileSprite?:boolean
}){

  const mandatorySvgoOptions:OptimizeOptions = {
    path: filePath,
    plugins: !singleFileSprite
    ? [
        {
          name: 'prefixIds',
          params:  {
            prefix: stylePrefix+'--'+symbolId,
          }
        }
     ]
    : []
  };

  // Enable default optimizations
  if(svgoOptions.presetDefault) {
    // We use unshift() otherwise the mandatory options will overwrite the presets 
    mandatorySvgoOptions.plugins?.unshift({
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIDs: {
            remove: !singleFileSprite, // disable if is already sprite 
            minify: !singleFileSprite // disable if is already sprite 
          },
        }
      }
    })
  }

  // Merge incoming options 
  svgoOptions = {...svgoOptions, ...mandatorySvgoOptions }
  
  const rawSvgString = await readFile(filePath, 'utf-8');
  const readySvgString = optimize(rawSvgString, svgoOptions)

  function checkForSVGOError(obj: unknown): obj is OptimizedError {
    return typeof obj === 'object' && obj !== null && !('data' in obj)
  }

  if (checkForSVGOError(readySvgString)) {
    console.error('SVGO run error:', readySvgString)
    throw new Error("SVGO run error");
  }

  return readySvgString.data
}
