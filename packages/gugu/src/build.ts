import fs from 'fs-extra';
import { GContext } from './ctx';
import { build as viteBuild } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import path from 'path';
import { createServer } from './createServer';

export async function build(ctx: GContext, options = {}) {
  fs.emptyDirSync(path.resolve(ctx.dirs.guguRoot, 'dist'));

  await viteBuild({
    mode: 'production',
    root: ctx.dirs.appDir,
    configFile: false,
    plugins: [
      vuePlugin({
        isProduction: true,
      }),
    ],
    define: {
      __PROD__: true,
    },
    build: {
      manifest: true,
      outDir: path.resolve(ctx.dirs.guguRoot, 'dist/client'),
    },
  });

  await viteBuild({
    mode: 'production',
    root: ctx.dirs.appDir,
    configFile: false,
    plugins: [
      vuePlugin({
        isProduction: true,
      }),
    ],
    define: {
      __PROD__: true,
    },
    build: {
      outDir: path.resolve(ctx.dirs.guguRoot, 'dist/server'),
      ssr: 'entry-server.ts',
    },
  });
}
