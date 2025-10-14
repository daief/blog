import { ILogger, injectLogger } from '../utils/logger.mts';
import { IBlogConifg } from '../../types/config.mts';

export class ConfigService {
  @injectLogger('[ConfigService]')
  private readonly logger!: ILogger;

  blogConfig!: IBlogConifg;
  cwd!: string;

  get IsDev() {
    return this.blogConfig.mode === 'development';
  }

  init({ cwd, blogConfig }: { cwd: string; blogConfig: IBlogConifg }) {
    this.logger.info('mode:', blogConfig.mode);
    this.blogConfig = blogConfig;
    this.cwd = cwd;
  }
}
