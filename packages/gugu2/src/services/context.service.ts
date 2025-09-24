import type { IBlogConifg } from '../../types/config.mts';
import { createLogger } from '../utils/index.mts';

const logger = createLogger('info');

export class ContextService {
  blogConfig: IBlogConifg;
  cwd: string;

  constructor(cwd: string, cfg: IBlogConifg) {
    this.cwd = cwd;
    this.blogConfig = cfg;

    logger.info('初始化 ContextService...', cwd);
  }
}
