import { type Plugin } from 'vite';
import { getService } from '../services/accessor.ts';
import { MarkdownService } from '../services/markdown.service.ts';

export const createMdPlugin = () => {
  const plugin: Plugin = {
    name: 'blog:md',
  };

  getService(MarkdownService);

  return plugin;
};
