import { GContext } from 'src/ctx';
import marked from 'marked';
import hljs from 'highlight.js';
import { escapeHtml } from '../utils/parseMarkdown';
import { dirname, join, relative, resolve } from 'path';
import { CollectionChain, omit } from 'lodash';
import fm from 'front-matter';
import glob from 'glob-promise';
import fs from 'fs-extra';
import { md5 } from '../utils/helper';
import dayjs from 'dayjs';

export class GLoader {
  private gg: GContext;

  private resolvingMarkdown: {
    filename: string;
    id: string;
  };

  // 文章 id
  private assets: Map<
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

  renderer: marked.Renderer;

  constructor(ctx: GContext) {
    this.gg = ctx;
    this.assets = new Map();
  }

  async init() {
    this.createRender();
    await this.loadMarkdownFiles();
    await this.loadAssets();
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
    this.renderer.image = (href, title, text) => {
      const { resolvingMarkdown } = this;
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
  }

  private async loadMarkdownFiles() {
    const getPosts = async (type: 'posts' | 'pages') => {
      const results = await glob(
        `${this.gg.dirs.sourceDir}/${type}/**/*.md`,
        {},
      );
      const p = [];
      for await (const mdPath of results) {
        const content = await fs.readFile(mdPath, 'utf-8');
        const hash = md5(content);

        this.resolvingMarkdown = {
          filename: mdPath,
          id: '',
        };
        // id 在 parseMarkdown 方法中赋值
        const parsedResult = this.parseMarkdown(content);

        this.resolvingMarkdown = null;

        p.push({
          ...parsedResult,
          date: parsedResult.date || dayjs().format(),
          hash,
          slug: '',
          path: '',
          updated: '',
          tags: [],
          categories: [],
          published: true,
          isPost: type === 'posts',
          filename: mdPath,
        });
      }
      return p;
    };

    const [posts, pages] = await Promise.all(
      ['posts', 'pages'].map((type) =>
        getPosts(type as any).then((ls) => {
          return ls.sort(
            (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
          );
        }),
      ),
    );

    const all = [...posts, ...pages];

    const allTags: ggDB.ITag[] = [];
    const allCategories: ggDB.ICategory[] = [];

    all.forEach((post) => {
      const { strTags, strCategories } = post;

      if (!post.isPost) {
        post.slug = relative(this.gg.dirs.sourceDir + '/pages', post.filename)
          .replace(/\.md$/i, '')
          .replace(/^\/?/, '/');
        return;
      }

      post.slug = `post/${post.id}`;
      post.path = '/' + post.slug;

      // 下面仅针对文章进行标签、分类处理
      // handle tags
      post.tags = strTags.map((tagName) => {
        let newItem: ggDB.ITag = allTags.find((it) => it.name === tagName);
        if (!newItem) {
          newItem = {
            id: md5(tagName),
            name: tagName,
            slug: 'tags/' + tagName,
            path: '/tags/' + tagName,
            postIds: [],
          };
          allTags.push(newItem);
        }
        newItem.postIds.push(post.id);
        return newItem;
      });

      // handle Categories
      post.categories = strCategories.map((cName, i) => {
        let item = allCategories.find((it) => it.name === cName);
        if (!item) {
          item = {
            id: md5(cName),
            name: cName,
            slug: 'categories/' + cName,
            path: '/categories/' + cName,
            parentId: i === 0 ? '' : md5(strCategories[i - 1]),
            postIds: [],
          };
          allCategories.push(item);
        }
        item.postIds.push(post.id);
        return item;
      });
    });

    [
      ['tags', allTags],
      ['categories', allCategories],
      ['posts', posts],
      ['pages', pages],
    ].forEach(([type, data]: [string, any[]]) => {
      (this.gg.dao.db._.get(type) as CollectionChain<any>)
        .push(...data)
        .commit();
    });
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

    this.resolvingMarkdown.id = metadata.id;

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
