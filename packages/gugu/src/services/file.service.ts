import { ILogger, injectLogger } from '../utils/logger.mts';
import { injectService } from './accessor.ts';
import * as path from 'path';
import chokidar, { type FSWatcher } from 'chokidar';
import { ConfigService } from './config.service.ts';
import { normalizePath } from 'vite';
import { getDirname } from '../utils/path.mts';

export class FileService {
  @injectLogger('[FileService]')
  private readonly logger!: ILogger;

  @injectService(() => ConfigService)
  configService!: ConfigService;

  watcher: FSWatcher | null = null;

  async init() {
    if (!this.configService.IsDev) return;

    this.watcher = chokidar.watch(this.resolveSource(), {
      ignored: (file, stats) =>
        Boolean(stats?.isFile() && !file.endsWith('.md')),
    });

    const ready = Promise.withResolvers<void>();
    this.watcher
      .once('ready', () => ready.resolve())
      .once('error', (err: any) => ready.resolve(err));
    await ready.promise;

    this.logger.info('ready' + (this.watcher ? ' with watcher' : ''));
  }

  resolveSource(...args: string[]) {
    return path.resolve(this.configService.cwd, 'source', ...args);
  }

  resolveDist(...args: string[]) {
    return path.resolve(this.configService.cwd, 'dist', ...args);
  }

  resolveApp(...args: string[]) {
    return getDirname(import.meta.url, '../../app', ...args);
  }

  isArticle(filename: string) {
    return [this.resolveSource('posts')]
      .map((it) => normalizePath(it))
      .some((it) => filename.startsWith(it));
  }
}
