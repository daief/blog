import type { IBlogConifg } from '../../types/config.mts';
import { ILogger, injectLogger } from '../utils/index.mts';
import { injectService } from './accessor.ts';
import { ConfigService } from './config.service.ts';
import { FileService } from './file.service.ts';
import { MarkdownService } from './markdown.service.ts';

export class ContextService {
  @injectLogger('[ContextService]')
  logger!: ILogger;

  @injectService(() => ConfigService)
  configService!: ConfigService;
  @injectService(() => MarkdownService)
  markdownService!: MarkdownService;
  @injectService(() => FileService)
  fileService!: FileService;

  async init(initOpts: { cwd: string; blogConfig: IBlogConifg }) {
    this.configService.init(initOpts);
    await this.fileService.init();
    await this.markdownService.init();
  }
}
