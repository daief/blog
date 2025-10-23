import { defineConfig } from 'vite';
import { extendConfig } from '@blog/gugu';

export default defineConfig((env) => {
  return extendConfig(
    {
      mode: env.mode,
      title: 'daief的个人日志',
    },
    {
      plugins: [],
    },
  );
});
