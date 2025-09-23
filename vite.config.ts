import { defineConfig } from 'vite';
import { extendConfig } from '@blog/gugu2';

export default defineConfig(() => {
  return extendConfig(
    {},
    {
      plugins: [],
    },
  );
});
