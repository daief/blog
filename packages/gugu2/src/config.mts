import type { UserConfig } from 'vite';
import path from 'path';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { getDirname } from './utils/path.mts';
import { createMdPlugin } from './plugins/md.mts';
import type { IBlogConifg } from '../types/index.mts';
import { ContextService } from './services/context.service.ts';
import { createRoutesPlugin } from './plugins/routes/index.mts';

const __dirname = getDirname(import.meta.url);

export const extendConfig = (blogConfig: IBlogConifg, config: UserConfig) => {
  const ggCtx = new ContextService(process.cwd(), blogConfig);
  global.ggContext = ggCtx;

  config.root = path.resolve(__dirname, '../app');
  config.plugins = [
    createMdPlugin(),
    createRoutesPlugin(),
    vuePlugin(),
    vueJsx({}),
    ...(config.plugins || []),
  ];

  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      '@app': path.resolve(__dirname, '../app'),
    },
  };

  config.build = {
    ...config.build,
    outDir: path.resolve(ggCtx.cwd, 'dist'),
  };

  return config;
};
