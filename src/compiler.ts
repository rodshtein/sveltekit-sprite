import type { Options } from './types'
import _merge from 'lodash.merge'

import { 
  optimize, 
  type OptimizedError, 
  type OptimizeOptions,
  type Plugin,
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
      svgoOptions: pluginsConstructor({
        filePath: svgSource, 
        symbolId: symbolPrefix, 
        stylePrefix,
        svgoOptions,
        singleFileSprite: true
        }),
      filePath: svgSource
    })
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
  
  const readySvgString = await optimizeSVG({ 
    svgoOptions: pluginsConstructor({ 
      filePath, 
      symbolId, 
      stylePrefix, 
      svgoOptions
    }),
    filePath
  });

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
  svgoOptions,
}:{
  filePath:string, 
  svgoOptions:OptimizeOptions & {presetDefault?:boolean},
}){
  
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

const pluginsCache:{
  svgoOptions:OptimizeOptions & { presetDefault?:boolean }
} = {
  svgoOptions: {}
};

export function pluginsConstructor({
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

  // Only prefix, symbolId and filePath are uniq for every request
  const prefixIdsPlugin:Plugin = {
    name: 'prefixIds',
    params:  {
      prefix: stylePrefix + '--' + symbolId,
    }
  };

  if(pluginsCache.svgoOptions?.plugins){
    let plugin = pluginsCache.svgoOptions?.plugins?.find(plugin => {
      return typeof plugin === 'object' && plugin.name === 'prefixIds'
    })

    if( typeof plugin === 'object'){
      plugin = _merge(plugin, prefixIdsPlugin)
    }

    pluginsCache.svgoOptions.path = filePath;

  } else {
    svgoOptions.path = filePath;
    
    // Prepare SVGO Params 
    const defaultPreset:Plugin = {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIDs: {
            remove: false,
            minify: false
          },
        }
      }
    };

    if(!singleFileSprite && defaultPreset?.params?.overrides) {
      defaultPreset.params.overrides.removeViewBox = false 
    }

    let defaultConfigFound = false;
    let prefixIdsConfigFound = false;

    // Preparing a ready array of plugins 
    svgoOptions?.plugins?.forEach(plugin => {
      // Prepare plugins that were declared as a object
      if (typeof plugin === 'object') {

        // Merge our presets to preset-default
        if(plugin.name === 'preset-default'){
          defaultConfigFound = true;
          plugin.params = _merge(plugin.params, defaultPreset.params) 
        }

        // Ability to edit prefixes only in single file sprite
        if(plugin.name === 'prefixIds' && !singleFileSprite){
          prefixIdsConfigFound = true;
          plugin.params = _merge(plugin.params, prefixIdsPlugin.params) 
        }

      // Prepare plugins that were declared as a string 
      } else if(plugin === 'preset-default'){
        defaultConfigFound = true;
        plugin = defaultPreset

      } else if(plugin === 'prefixIds' && !singleFileSprite){
        prefixIdsConfigFound = true;
        plugin = prefixIdsPlugin
      }
    });

    // Add default preset if it's not presented
    if(!defaultConfigFound && svgoOptions.presetDefault){
      if(svgoOptions.plugins){
          svgoOptions.plugins.push(defaultPreset)
      } else {
          svgoOptions.plugins = [defaultPreset]
      }
    }

    // Add prefix ids plugin if it's not presented
    if(!prefixIdsConfigFound && !singleFileSprite){
      if(svgoOptions.plugins){
        svgoOptions.plugins.push(prefixIdsPlugin)
      } else {
        svgoOptions.plugins = [prefixIdsPlugin]
      }
    }

    pluginsCache.svgoOptions = svgoOptions
  }

  console.dir(svgoOptions, { depth: null });

  return pluginsCache.svgoOptions
}