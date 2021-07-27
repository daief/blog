import { GContext } from 'src/ctx';
import { InlineConfig } from 'vite';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { merge } from 'lodash';
import { IUserConfig } from '@t';

export function getViteConfig(
  ctx: GContext,
  isProd: boolean,
  config: InlineConfig = {},
): InlineConfig {
  function highlightPlugin() {
    const virtualFileId = '@gugu-highlight-theme';

    return {
      name: 'highlightPlugin', // 必须的，将会在 warning 和 error 中显示
      resolveId(id) {
        if (id === virtualFileId) {
          return virtualFileId;
        }
      },
      load(id) {
        if (id === virtualFileId) {
          return `import "highlight.js/styles/${ctx.userConfig.highlight.theme}.css"`;
        }
      },
    };
  }

  return merge(
    {},
    {
      mode: isProd ? 'production' : 'development',
      root: ctx.dirs.appDir,
      plugins: [vuePlugin(), vueJsx({}), highlightPlugin()],
      configFile: false,
      define: {
        __PROD__: isProd,
        __INJECTED_USER_CONFIG__: JSON.stringify({
          ...ctx.userConfig,
          outDir: '',
        } as IUserConfig),
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
