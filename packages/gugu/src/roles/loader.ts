import { GContext } from 'src/ctx';
import marked from 'marked';
import hljs from 'highlight.js';
import { escapeHtml } from '../utils/parseMarkdown';
import { basename, dirname, join, relative, resolve } from 'path';
import { CollectionChain, omit } from 'lodash';
import fm from 'front-matter';
import glob from 'glob-promise';
import fs from 'fs-extra';
import { md5, promiseQueue } from '../utils/helper';
import dayjs from 'dayjs';
import chokidar from 'chokidar';
import minimatch from 'minimatch';
import { parse } from 'query-string';
import htmlEntities from 'html-entities';

export class GLoader {
  private gg: GContext;

  // 文章 id
  // private assets: Map<string, ggDB.IAssetInfo[]>;

  renderer: marked.Renderer;
  watcher: chokidar.FSWatcher;

  constructor(ctx: GContext) {
    this.gg = ctx;
  }

  async init() {
    this.createRender();
    await this.loadAllMarkdownFiles();
    if (this.gg.command === 'dev') {
      this.watch();
    }
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
    return `${this.gg.dirs.sourceDir}/?(posts|pages|drafts)/**/*.md`;
  }

  private watch() {
    const handleAssetFile = (fl: string, isDelete = false) => {
      const relativePath = relative(
        resolve(this.gg.dirs.userRoot, 'source'),
        fl,
      );
      const targetFname = join(
        this.gg.dirs.guguRoot,
        'dist/client',
        relativePath,
      );
      if (isDelete) {
        fs.removeSync(targetFname);
        return;
      }
      fs.copySync(fl, targetFname, { recursive: true });
    };

    this.watcher = chokidar
      .watch(`${this.gg.dirs.sourceDir}/**/*`, {
        interval: 1000,
      })
      .on('change', (fname) => {
        if (minimatch(fname, this.getMarkdowGlob)) {
          return this.onUpdateNewMd(fname);
        }
        if (!this.gg.isInArticleDir(fname)) {
          handleAssetFile(fname);
        }
      })
      .on('add', (fname) => {
        if (minimatch(fname, this.getMarkdowGlob)) {
          return this.onAddNewMd(fname);
        }
        if (!this.gg.isInArticleDir(fname)) {
          handleAssetFile(fname);
        }
      })
      .on('unlink', (fname) => {
        if (minimatch(fname, this.getMarkdowGlob)) {
          return this.onDeleteNewMd(fname);
        }
        if (!this.gg.isInArticleDir(fname)) {
          handleAssetFile(fname, true);
        }
      });
  }

  private async onAddNewMd(mdPath: string) {
    const res = await this.parseMarkdown(mdPath);
    await this.reSortDB([res], 'insert');
  }

  private async onDeleteNewMd(mdPath: string) {
    await this.reSortDB([{ filename: mdPath } as any], 'delete');
  }

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
    if (this.gg.command !== 'dev' && type === 'insert') {
      partial = partial.filter((it) => it.published);
    }

    const { _ } = this.gg.dao.db;
    let all = _.get('posts')
      .filter((it) => !partial.some((p) => p.id === it.id))
      .value();

    let allTags: ggDB.ITag[] = _.get('tags').value();
    let allCategories: ggDB.ICategory[] = _.get('categories').value();

    if (type === 'insert') {
      // TODO code refine
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
            item.postIds = [...new Set(item.postIds)];
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
      });

      all.push(...partial);
      all
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
        .sort((a, b) => b.sort - a.sort);
    } else {
      // delete
      const removed: ggDB.IPost[] = [];

      all = all.filter((it) => {
        if (partial.some((p) => p.filename === it.filename)) {
          removed.push(it);
          return false;
        }
        return true;
      });

      const filterLabels = (labels: any[]) => {
        return labels.filter((it) => {
          it.postIds = it.postIds.filter(
            (id) => !removed.some((p) => p.id === id),
          );
          return it.postIds.length;
        });
      };
      allTags = filterLabels(allTags);
      allCategories = filterLabels(allCategories);
    }

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

    if (type === 'insert') {
      await this.loadAssets(partial.map((it) => it.assetInfoList).flat());
    }
  }

  private async loadAllMarkdownFiles() {
    const mdPathList = await glob(this.getMarkdowGlob, {});

    const all = await promiseQueue(
      mdPathList.map((f) => this.parseMarkdown(f)),
    );

    await this.reSortDB(all);
  }

  private async loadAssets(assetInfoLs: ggDB.IAssetInfo[]) {
    for (const ass of assetInfoLs) {
      try {
        fs.copySync(
          ass.assetFilePath,
          join(this.gg.dirs.guguRoot, 'dist/client', ass.targetPath),
          { overwrite: true, recursive: true },
        );
      } catch (error) {}
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
      sort: number;
    }>(source);

    const isArticle = !filename.startsWith(
      resolve(this.gg.dirs.sourceDir, 'pages'),
    );
    const published = !filename.startsWith(
      resolve(this.gg.dirs.sourceDir, 'drafts'),
    );

    const assetInfoList: ggDB.IAssetInfo[] = [];

    this.renderer.image = (href, imgAttrsQuery, alt) => {
      const isNotFilePath = href.startsWith('http') || href.startsWith('//');
      const imgBaseName = basename(href);

      const imgAttrs = parse(
        htmlEntities.decode(imgAttrsQuery || ''),
      ) as Record<string, string>;
      if (Number.isFinite(+imgAttrs.width)) {
        imgAttrs.width = imgAttrs.width + 'px';
      }

      const createImg = (src: string) => {
        const attrsStr = Object.entries({
          alt: alt || imgAttrs.title || imgBaseName,
          loading: 'lazy',
          ...imgAttrs,
          title: imgAttrs.title || alt || imgBaseName,
          class: `post-image ${imgAttrs.class || ''}`,
          src,
        })
          .map(([key, value]) =>
            value ? `${key}=${JSON.stringify(htmlEntities.encode(value))}` : '',
          )
          .join(' ');
        return `<img ${attrsStr}>`;
      };

      if (isNotFilePath) {
        return createImg(href);
      }

      const assetFilePath = resolve(dirname(filename), href);
      const hashname = `${md5(
        relative(this.gg.dirs.sourceDir, assetFilePath),
      )}.${basename(assetFilePath)}`;
      const targetPath = resolve('/images', hashname);

      assetInfoList.push({
        assetFilePath,
        relativePath: href,
        referenceMarkdown: filename,
        targetPath,
      });

      return createImg(targetPath);
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
      sort: Number.isFinite(metadata.sort) ? metadata.sort : 0,
      comments: metadata.comments !== false,
      published,
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
