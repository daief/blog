import { type Plugin } from 'vite';
import { getService } from '../services/accessor.ts';
import { PostManageService } from '../services/post-manage.service.ts';

export const createMdPlugin = () => {
  const plugin: Plugin = {
    name: 'blog:md',
  };

  getService(PostManageService);

  return plugin;
};
