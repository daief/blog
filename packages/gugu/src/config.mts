import { type UserConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import VueMacros from 'vue-macros/vite';
import tailwindcss from '@tailwindcss/vite';

import { createMdPlugin } from './plugins/md.mts';
import type { IBlogConifg } from '../types/index.mts';
import { ContextService } from './services/context.service.ts';
import { getService } from './services/accessor.ts';
import { FileService } from './services/file.service.ts';
import { createVBlogPlugin } from './plugins/vblog.mts';
import { createLogger } from './utils/logger.mts';
import { getDirname } from './utils/path.mts';

const logger = createLogger('[extendConfig]');

export const extendConfig = async (
  blogConfig: IBlogConifg,
  viteConfig: UserConfig,
) => {
  logger.info('Start...');

  const ggCtx = getService(ContextService);
  global.ggContext = ggCtx;
  await ggCtx.init({ cwd: process.cwd(), blogConfig });

  const fileService = getService(FileService);

  viteConfig.root = fileService.resolveApp();
  viteConfig.publicDir = fileService.resolveSource('public');
  viteConfig.plugins = [
    tailwindcss(),
    VueMacros({
      plugins: {
        vue: vuePlugin(),
        vueJsx: vueJsx({}),
      },
    }),
    createMdPlugin(),
    createVBlogPlugin(),
    ...(viteConfig.plugins || []),
  ];

  viteConfig.resolve = {
    ...viteConfig.resolve,
    alias: {
      ...viteConfig.resolve?.alias,
      '@app': fileService.resolveApp(),
      '@source': fileService.resolveSource(),
      '@mcss': fileService.resolveApp('styles/main.css'),
    },
  };

  viteConfig.build = {
    emptyOutDir: true,
    ...viteConfig.build,
    outDir: fileService.resolveDist(),
    copyPublicDir: true,
  };

  return viteConfig;
};
