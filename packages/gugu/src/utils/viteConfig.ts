import { GContext } from 'src/ctx';
import { InlineConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import { merge } from 'lodash';

export function getViteConfig(
  ctx: GContext,
  isProd: boolean,
  config: InlineConfig = {},
): InlineConfig {
  return merge(
    {},
    {
      mode: isProd ? 'production' : 'development',
      root: ctx.dirs.appDir,
      plugins: [vuePlugin()],
      configFile: false,
      define: {
        __PROD__: isProd,
      },
      resolve: {
        alias: {
          '@app': ctx.resolveGuguRoot('app'),
        },
      },
    },
    config,
  );
}
