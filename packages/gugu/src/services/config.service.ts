import { ILogger, injectLogger } from '../utils/logger.mts';
import { IBlogConifg } from '../../types/config.mts';

export class ConfigService {
  @injectLogger('[ConfigService]')
  private readonly logger!: ILogger;

  blogConfig!: IBlogConifg;
  cwd!: string;

  init(initOpts: { cwd: string; blogConfig: IBlogConifg }) {
    this.blogConfig = initOpts.blogConfig;
    this.cwd = initOpts.cwd;
  }
}
