import { EventEmitter } from 'events';
import { resolve } from 'path';
import marked from 'marked';
import hljs from 'highlight.js';
import { escapeHtml } from './utils/parseMarkdown';
import fs from 'fs-extra';
import { merge } from 'lodash';
import yml from 'js-yaml';
import { IUserConfig } from '@t';
import { GuDao } from './roles/dao';

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

  renderer: marked.Renderer;

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
      appDir,
      userRoot,
      cacheDir,
      sourceDir,
    };

    this.dao = new GuDao(this);
  }

  async init() {
    await this.resolveConfig();

    // ----------- renderer
    this.renderer = new marked.Renderer();
    this.renderer.code = (sourceCode, language) => {
      // 处理 mermaid 图表
      if (/^mermaid$/i.test(language)) {
        return `<div class="mermaid">${sourceCode}</div>`;
      }
      const codeResult = !hljs.getLanguage(language)
        ? escapeHtml(sourceCode)
        : hljs.highlight(sourceCode, { language }).value;
      return `<pre class="hljs language-${language}"><code style="display:block;">${codeResult}</code></pre>`;
    };
    this.renderer.heading = (text: string, level) => {
      const anchorText = `${text}`;
      return `<h${level} id="${anchorText}">${anchorText}<a name="${anchorText}" class="anchor" href="#${anchorText}"></a></h${level}>`;
    };

    await this.dao.init();
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
