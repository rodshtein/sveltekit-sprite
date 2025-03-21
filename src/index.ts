import { writeFileSync } from 'fs'
import { type ViteDevServer, Plugin } from 'vite'
import { compiler } from './compiler'
import type { Options } from './types'

function sveltekitSprite({
  svgSource = 'src/lib/sprite',
  outputFile = 'src/lib/sveltekit-sprite.svg',
  symbolPrefix,
  stylePrefix,
  svgoOptions,
}: Options = {}): Plugin {
  let viteDevServer: ViteDevServer | undefined;

  async function generateSprite() {
      try {
          const filesString = await compiler({
              svgSource,
              symbolPrefix,
              stylePrefix,
              svgoOptions
          });

          writeFileSync(outputFile, filesString);

          if (viteDevServer) {
            viteDevServer.ws.send({
              type: 'full-reload',
              path: '*'
            });
          }
      } catch (error) {
          console.error("[sveltekit-sprite:error] generating sprite:", error);
      }
  }

  return {
    name: "sveltekit-sprite",
    async buildStart() {
        await generateSprite();
    },
    configureServer(server) {
        viteDevServer = server;
    },
    watchChange: async function (path) {
      if (path.includes(svgSource)) {
        await generateSprite();
      }
    },
  }
}

export { sveltekitSprite }
