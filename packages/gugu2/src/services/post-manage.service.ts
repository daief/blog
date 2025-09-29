import { ILogger, injectLogger } from '../utils/logger.mts';
import { ContextService } from './context.service.ts';
import { getService } from './accessor.ts';

export class PostManageService {
  @injectLogger('[PostManageService]')
  logger!: ILogger;

  constructor() {
    this.logger.info('初始化 PostManageService...');
  }
}
