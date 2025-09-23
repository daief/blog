import type { UserConfig } from 'vite';
import path from 'path';
import { getDirname } from './utils/path.mts';
import { createMdPlugin } from './plugins/md.mts';
import type { IBlogConifg } from '../types/index.mts';

const __dirname = getDirname(import.meta.url);

export const extendConfig = (blogConfig: IBlogConifg, config: UserConfig) => {
  config.root = path.resolve(__dirname, '../app');
  config.plugins = [createMdPlugin(), ...(config.plugins || [])];
  return config;
};
