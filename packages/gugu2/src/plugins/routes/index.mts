import { type Plugin } from 'vite';

export const createRoutesPlugin = () => {
  const plugin: Plugin = {
    name: 'blog:routes',
    resolveId(id) {
      if (id === 'vblog:routes') {
        return 'vblog:routes';
      }
    },
    load(id, options) {
      if (id === 'vblog:routes') {
        return `export default [
      {
        path: '/1',
        component: () => import('@app/components/test.vue')
      }
        ]`;
      }
      return null;
    },
  };

  return plugin;
};
