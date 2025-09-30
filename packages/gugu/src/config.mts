import type { UserConfig } from 'vite';
import * as path from 'path';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { getDirname } from './utils/path.mts';
import { createMdPlugin } from './plugins/md.mts';
import type { IBlogConifg } from '../types/index.mts';
import { ContextService } from './services/context.service.ts';
import { getService } from './services/accessor.ts';
import { FileService } from './services/file.service.ts';
import { createVBlogPlugin } from './plugins/vblog.mts';
import { createLogger } from './utils/logger.mts';

const logger = createLogger('[extendConfig]');
const __dirname = getDirname(import.meta.url);

export const extendConfig = async (
  blogConfig: IBlogConifg,
  viteConfig: UserConfig,
) => {
  logger.info('Start...');

  const ggCtx = getService(ContextService);
  global.ggContext = ggCtx;
  await ggCtx.init({ cwd: process.cwd(), blogConfig });

  viteConfig.root = path.resolve(__dirname, '../app');
  viteConfig.plugins = [
    createMdPlugin(),
    createVBlogPlugin(),
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
    emptyOutDir: true,
    ...viteConfig.build,
    outDir: getService(FileService).resolveDist(),
  };

  return viteConfig;
};
