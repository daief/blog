import { GContext } from './ctx';
import { build as viteBuild } from 'vite';
import path from 'path';
import { getViteConfig } from './utils/viteConfig';

export async function build(ctx: GContext, options = {}) {
  await viteBuild(
    getViteConfig(ctx, true, {
      build: {
        manifest: true,
        outDir: path.resolve(ctx.dirs.root, 'dist/client'),
      },
    }),
  );

  await viteBuild(
    getViteConfig(ctx, true, {
      build: {
        outDir: path.resolve(ctx.dirs.root, 'dist/server'),
        ssr: 'entry-server.ts',
      },
    }),
  );
}
