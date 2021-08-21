import { EventEmitter } from 'events';
import { resolve } from 'path';
import fs from 'fs-extra';
import { merge } from 'lodash';
import yml from 'js-yaml';
import { IUserConfig } from '@t';
import { GuDao } from './roles/dao';
import { GLoader } from './roles/loader';

export type ICommandType = 'dev' | 'build' | 'serve' | 'generate';

export interface IGContextOptions {
  command: ICommandType;
  emitterOptions?: any;
}

export class GContext extends EventEmitter {
  context = process.cwd();

  command: ICommandType;
  userConfig: IUserConfig;

  dirs = {
    guguRoot: '',
    guguDistClient: '',
    appDir: '',
    cacheDir: '',

    userRoot: '',
    sourceDir: '',
  };

  dao: GuDao;
  loader: GLoader;

  constructor(opts: IGContextOptions) {
    super(opts.emitterOptions);

    this.command = opts.command;

    const guguRoot = resolve(__dirname, '..');
    const appDir = resolve(guguRoot, 'app');
    const userRoot = this.context;
    const cacheDir = resolve(userRoot, '.cache/.gugu');
    const sourceDir = resolve(userRoot, 'source');

    this.dirs = {
      guguRoot,
      guguDistClient: resolve(guguRoot, 'dist/client'),
      appDir,
      userRoot,
      cacheDir,
      sourceDir,
    };

    this.dao = new GuDao(this);
    this.loader = new GLoader(this);
  }

  async init() {
    if (!['generate', 'serve'].includes(this.command)) {
      fs.emptyDirSync(this.resolveGuguRoot('dist'));
      fs.copySync(
        resolve(this.dirs.userRoot, 'source'),
        this.resolveGuguRoot('dist/client'),
        {
          recursive: true,
          filter: (src) => {
            return !this.isInArticleDir(src) && !this.isIgnoredAssets(src);
          },
        },
      );
    }

    await this.resolveConfig();
    await this.dao.init();
    await this.loader.init();
  }

  isInArticleDir(p: string) {
    return [
      resolve(this.dirs.userRoot, 'source/pages'),
      resolve(this.dirs.userRoot, 'source/posts'),
      resolve(this.dirs.userRoot, 'source/drafts'),
    ].some((it) => p.startsWith(it));
  }

  // 需要被忽略的自定义文件
  isIgnoredAssets(p: string) {
    return [this.dirs.sourceDir + '/.'].some((it) => p.startsWith(it));
  }

  private async resolveConfig() {
    let userConfig: IUserConfig;
    try {
      userConfig = yml.load(
        fs.readFileSync(resolve(this.dirs.userRoot, '.gugurc.yml'), 'utf-8'),
      );
    } catch (error) {
      userConfig = {};
    }
    this.userConfig = merge<IUserConfig, IUserConfig>(
      {
        outDir: 'dist',
        base: '/',
        siteMenus: {},
      },
      userConfig,
    );

    this.userConfig.outDir = resolve(
      this.dirs.userRoot,
      this.userConfig.outDir,
    );
  }

  public resolveGuguRoot(...p: string[]) {
    return resolve(this.dirs.guguRoot, ...p);
  }
}
