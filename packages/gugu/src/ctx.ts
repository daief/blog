import { EventEmitter } from 'events';
import { resolve, dirname } from 'path';
import marked from 'marked';
import hljs from 'highlight.js';
import { escapeHtml } from './utils/parseMarkdown';
import fs from 'fs-extra';
import { merge, omit } from 'lodash';
import yml from 'js-yaml';
import { IUserConfig } from '@t';
import { GuDao } from './roles/dao';
import fm from 'front-matter';

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

  // 文章 id
  assets: Map<
    string,
    Array<{
      // 资源文件完整路径
      assetFilePath: string;
      // 相对的一段路径
      relativePath: string;
      // 相关联的 md 文件
      referenceMarkdown: string;
      // 资源输出的路径
      targetPath: string;
    }>
  >;

  constructor(opts: IGContextOptions) {
    super(opts.emitterOptions);

    this.command = opts.command;
    this.assets = new Map();

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
      return `<pre class="hljs language-${language}" hljs-language="${language}"><code style="display:block;">${codeResult}</code></pre>`;
    };
    this.renderer.heading = (text: string, level) => {
      const anchorText = `${text}`;
      return `<h${level} id="${anchorText}">${anchorText}<a name="${anchorText}" class="headerlink" href="#${anchorText}"></a></h${level}>`;
    };
    this.renderer.image = (href, title, text) => {
      const { resolvingMarkdown } = this.dao;
      const isNotFilePath = href.startsWith('http') || href.startsWith('//');

      if (!resolvingMarkdown || isNotFilePath)
        return `<img src="${href || ''}" alt="${text || ''}" title="${
          title || ''
        }">`;

      const info = this.assets.get(resolvingMarkdown.id) || [];
      info.push({
        assetFilePath: resolve(dirname(resolvingMarkdown.filename), href),
        relativePath: href,
        referenceMarkdown: resolvingMarkdown.filename,
        targetPath: resolve('/post', href),
      });
      this.assets.set(resolvingMarkdown.id, info);

      return `<img src="${href || ''}" alt="${text || ''}" title="${
        title || ''
      }">`;
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

  public parseMarkdown(source: string) {
    const { attributes: metadata, body: markdownBody } = fm<{
      title: string;
      date: string;
      published: boolean;
      id: string;
      categories: string | string[];
      tags: string | string[];
      description: string;
      comments: boolean;
    }>(source);

    this.dao.resolvingMarkdown.id = metadata.id;

    const [excerpt, more = ''] = marked(markdownBody, {
      renderer: this.renderer,
    }).split('<!-- more -->');

    return {
      ...omit(metadata, ['tags', 'categories']),
      strCategories: strToArray(metadata.categories),
      strTags: strToArray(metadata.tags),
      excerpt,
      more,
      raw: source,
    };
  }
}

const strToArray = (s: string | string[] | null) => {
  if (typeof s === 'string') {
    return [s];
  }
  if (Array.isArray(s)) {
    return s;
  }
  return [];
};
