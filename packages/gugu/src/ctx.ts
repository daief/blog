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
    appDir: '',
    userRoot: '',
    cacheDir: '',
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

    if (this.command === 'dev') {
      fs.emptyDirSync(resolve(guguRoot, 'dist'));
    }

    this.dirs = {
      guguRoot,
      appDir,
      userRoot,
      cacheDir,
      sourceDir,
    };

    this.dao = new GuDao(this);
    this.loader = new GLoader(this);
  }

  async init() {
    await this.resolveConfig();
    await this.dao.init();
    await this.loader.init();
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
