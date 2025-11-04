import { defineConfig } from 'vite';
import { extendConfig } from '@blog/gugu';

export default defineConfig((env) => {
  return extendConfig(
    {
      mode: env.mode,
      title: `Daief's Blog`,
      author: 'daief',
      since: 2017,
    },
    {
      plugins: [],
    },
  );
});
