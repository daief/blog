import fs from 'fs-extra';
import { GContext } from './ctx';
import { build as viteBuild } from 'vite';
import path from 'path';
import { getViteConfig } from './utils/viteConfig';

export async function build(ctx: GContext, options = {}) {
  fs.emptyDirSync(path.resolve(ctx.dirs.guguRoot, 'dist'));

  await viteBuild(
    getViteConfig(ctx, false, {
      build: {
        manifest: true,
        outDir: path.resolve(ctx.dirs.guguRoot, 'dist/client'),
      },
    }),
  );

  await viteBuild(
    getViteConfig(ctx, false, {
      build: {
        outDir: path.resolve(ctx.dirs.guguRoot, 'dist/server'),
        ssr: 'entry-server.ts',
      },
    }),
  );
}
