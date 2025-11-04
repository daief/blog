import { defineConfig } from 'vite';
import { extendConfig } from '@blog/gugu';

export default defineConfig((env) => {
  return extendConfig(
    {
      mode: env.mode,
      title: `Daief's Blog`,
      url: 'https://daief.tech',
      author: 'daief',
      since: 2017,
      googleAnalytics: {
        id: 'G-NPFWE07FQ2',
      },
    },
    {
      plugins: [],
    },
  );
});
