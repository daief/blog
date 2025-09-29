import type { IBlogConifg } from '../../types/config.mts';
import { ILogger, injectLogger } from '../utils/index.mts';
import { injectService } from './accessor.ts';
import { PostManageService } from './post-manage.service.ts';

export class ContextService {
  @injectLogger('[ContextService]')
  logger!: ILogger;

  blogConfig!: IBlogConifg;
  cwd!: string;

  @injectService(PostManageService)
  postManageService!: PostManageService;

  init(cwd: string, cfg: IBlogConifg) {
    this.cwd = cwd;
    this.blogConfig = cfg;
    this.logger.info('初始化 ContextService....');
    this.postManageService;
  }
}
