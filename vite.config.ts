import { defineConfig } from 'vite';
import { extendConfig } from '@blog/gugu';

export default defineConfig((env) => {
  return extendConfig(
    {
      mode: env.mode,
      title: `Daief's Blog`,
      author: 'daief',
      since: 2017,
      googleAnalytics: {
        GA_MEASUREMENT_ID: 'UA-146082840-1',
      },
    },
    {
      plugins: [],
    },
  );
});
