import { type UserConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';

import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import Components from 'unplugin-vue-components/vite';

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
    vuePlugin(),
    vueJsx({}),
    createMdPlugin(),
    createVBlogPlugin(),

    Components({
      resolvers: [IconsResolver({})],
    }),
    Icons({
      defaultClass: 'iconify-svg',
      collectionsNodeResolvePath: [
        getDirname(import.meta.url),
        ggCtx.configService.cwd,
      ],
    }),

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

  viteConfig.define = {
    ...viteConfig.define,
    __BLOG_CONFIG__: JSON.stringify(blogConfig),
  };

  // @ts-ignore
  viteConfig.ssgOptions = {
    dirStyle: 'nested',
    htmlFileName: (filename) => {
      if (filename === '404/index.html') {
        return '404.html';
      }
      // output file static routes
      return decodeURIComponent(filename);
    },
  } satisfies import('vite-ssg').ViteSSGOptions;

  return viteConfig;
};
