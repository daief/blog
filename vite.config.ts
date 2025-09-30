import { defineConfig } from 'vite';
import { extendConfig } from '@blog/gugu';

export default defineConfig(() => {
  return extendConfig(
    {},
    {
      plugins: [],
    },
  );
});
