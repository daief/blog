import { GContext } from 'src/ctx';
import marked from 'marked';
import hljs from 'highlight.js';
import { escapeHtml } from '../utils/parseMarkdown';
import { dirname, join, relative, resolve } from 'path';
import { CollectionChain, omit } from 'lodash';
import fm from 'front-matter';
import glob from 'glob-promise';
import fs from 'fs-extra';
import { md5, promiseQueue } from '../utils/helper';
import dayjs from 'dayjs';
import chokidar from 'chokidar';
import minimatch from 'minimatch';

export class GLoader {
  private gg: GContext;

  // 文章 id
  private assets: Map<string, ggDB.IAssetInfo[]>;

  renderer: marked.Renderer;
  watcher: chokidar.FSWatcher;

  constructor(ctx: GContext) {
    this.gg = ctx;
    this.assets = new Map();
  }

  async init() {
    this.createRender();
    await this.loadAllMarkdownFiles();
    await this.loadAssets();
    this.watch();
  }

  private createRender() {
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
  }

  get getMarkdowGlob() {
    return `${this.gg.dirs.sourceDir}/?(posts|pages)/**/*.md`;
  }

  private watch() {
    this.watcher = chokidar.watch(`${this.gg.dirs.sourceDir}/**/*`, {
      interval: 1000,
    });
    this.watcher.on('change', (fname) => {
      if (minimatch(fname, this.getMarkdowGlob)) {
        return this.onUpdateNewMd(fname);
      }
    });
  }

  private async onAddNewMd(mdPath: string) {}

  private async onUpdateNewMd(mdPath: string) {
    const target = this.gg.dao.db._.get('posts')
      .find((it) => it.filename === mdPath)
      .value();
    if (!target) {
      return this.onAddNewMd(mdPath);
    }
    const res = await this.parseMarkdown(mdPath);
    if (target.hash === res.hash) return;

    await this.reSortDB([res], 'insert');
  }

  private async reSortDB(
    partial: IHandledPost[],
    type: 'insert' | 'delete' = 'insert',
  ) {
    const { _ } = this.gg.dao.db;
    let all = _.get('posts')
      .filter((it) => !partial.some((p) => p.id === it.id))
      .value();

    let allTags: ggDB.ITag[] = _.get('tags').value();
    let allCategories: ggDB.ICategory[] = _.get('categories').value();

    partial.forEach((post) => {
      if (!post.isArticle) {
        return;
      }
      const { strTags, strCategories } = post;

      function handleLabels<T extends Partial<ggDB.ICategory & ggDB.ITag>>(
        strs: string[],
        labels: T[],
        isTag = true,
      ): [T[], T[]] {
        // 需要被添加的 label
        const items = strs.map((cName, i) => {
          let item = labels.find((it) => it.name === cName);
          if (!item) {
            item = {
              id: md5(cName),
              name: cName,
              postIds: [],
            } as any;
            labels.push(item);
          }

          if (!isTag) {
            Object.assign(item, {
              slug: 'categories/' + cName,
              path: '/categories/' + cName,
              parentId: i === 0 ? '' : md5(strs[i - 1]),
            });
          }

          item.postIds.push(post.id);
          return item;
        });

        // 需要被移除的 label
        const removed = labels
          .filter(
            (it) => it.postIds.includes(post.id) && !strs.includes(it.name),
          )
          .map((it) => {
            it.postIds = it.postIds.filter((id) => id !== post.id);
            return it;
          })
          .filter((it) => it.postIds.length === 0);

        return [items, labels.filter((it) => !removed.includes(it))];
      }

      [post.tags, allTags] = handleLabels(strTags, allTags, true);
      [post.categories, allCategories] = handleLabels(
        strCategories,
        allCategories,
        false,
      );

      console.log({
        allCategories,
      });
    });

    all.push(...partial);
    all.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    [
      ['tags', allTags],
      ['categories', allCategories],
      ['posts', all],
    ].forEach(([type, data]: [string, any[]]) => {
      (this.gg.dao.db._.get(type) as CollectionChain<any>)
        .set('length', 0)
        .push(...data)
        .commit();
    });
  }

  private async loadAllMarkdownFiles() {
    const mdPathList = await glob(this.getMarkdowGlob, {});

    const all = await promiseQueue(
      mdPathList.map((f) => this.parseMarkdown(f)),
    );

    await this.reSortDB(all);
  }

  private async loadAssets() {
    for (const [id, assetInfoLs] of this.assets) {
      for (const ass of assetInfoLs) {
        try {
          fs.copySync(
            ass.assetFilePath,
            join(this.gg.dirs.guguRoot, 'dist/client/post', ass.relativePath),
            { overwrite: true, recursive: true },
          );
        } catch (error) {}
      }
    }
  }

  public async parseMarkdown(filename: string): Promise<IHandledPost> {
    const source = await fs.readFile(filename, 'utf-8');

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

    const isArticle = filename.startsWith(
      resolve(this.gg.dirs.sourceDir, 'posts'),
    );

    const assetInfoList: ggDB.IAssetInfo[] = [];

    this.renderer.image = (href, title, text) => {
      const isNotFilePath = href.startsWith('http') || href.startsWith('//');

      if (isNotFilePath)
        return `<img src="${href || ''}" alt="${text || ''}" title="${
          title || ''
        }">`;

      assetInfoList.push({
        assetFilePath: resolve(dirname(filename), href),
        relativePath: href,
        referenceMarkdown: filename,
        targetPath: resolve('/post', href),
      });

      return `<img src="${href || ''}" alt="${text || ''}" title="${
        title || ''
      }">`;
    };

    if (!metadata.id) {
      if (!isArticle) {
        metadata.id = md5(filename);
      } else {
        throw new Error(`请补充【${filename}】的 id。`);
      }
    }

    const [excerpt, more = ''] = marked(markdownBody, {
      renderer: this.renderer,
    }).split('<!-- more -->');

    let slug = '';
    if (!isArticle) {
      slug = relative(resolve(this.gg.dirs.sourceDir, 'pages'), filename)
        .replace(/\.md$/i, '')
        .replace(/^\/?/, '');
    } else {
      slug = `post/${metadata.id}`;
    }

    return {
      ...omit(metadata, ['tags', 'categories']),
      // TODO 状态
      published: true,
      slug,
      path: '/' + slug,
      updated: '',
      tags: [],
      categories: [],
      filename,
      hash: md5(source),
      isArticle,
      strCategories: strToArray(metadata.categories),
      strTags: strToArray(metadata.tags),
      excerpt,
      more,
      raw: source,
      assetInfoList,
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

interface IHandledPost extends ggDB.IPost {
  strCategories: string[];
  strTags: string[];
  assetInfoList: ggDB.IAssetInfo[];
}
