import { type Plugin } from 'vite';

export const createMdPlugin = () => {
  const plugin: Plugin = {
    name: 'blog:md',
  };

  return plugin;
};
