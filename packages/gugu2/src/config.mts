import type { UserConfig } from 'vite';
import path from 'path';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { getDirname } from './utils/path.mts';
import { createMdPlugin } from './plugins/md.mts';
import type { IBlogConifg } from '../types/index.mts';
import { ContextService } from './services/context.service.ts';
import { createRoutesPlugin } from './plugins/routes/index.mts';
import { getService } from './services/accessor.ts';

const __dirname = getDirname(import.meta.url);

export const extendConfig = (
  blogConfig: IBlogConifg,
  viteConfig: UserConfig,
) => {
  const ggCtx = getService(ContextService);
  global.ggContext = ggCtx;
  ggCtx.init(process.cwd(), blogConfig);

  viteConfig.root = path.resolve(__dirname, '../app');
  viteConfig.plugins = [
    createMdPlugin(),
    createRoutesPlugin(),
    vuePlugin(),
    vueJsx({}),
    ...(viteConfig.plugins || []),
  ];

  viteConfig.resolve = {
    ...viteConfig.resolve,
    alias: {
      ...viteConfig.resolve?.alias,
      '@app': path.resolve(__dirname, '../app'),
    },
  };

  viteConfig.build = {
    ...viteConfig.build,
    outDir: path.resolve(ggCtx.cwd, 'dist'),
  };

  return viteConfig;
};
