import { EventEmitter } from 'events';
import { resolve, relative } from 'path';
import { DB } from './roles/db';
import glob from 'glob-promise';
import marked from 'marked';
import hljs from 'highlight.js';
import { escapeHtml, parseMarkdown } from './utils/parseMarkdown';
import fs from 'fs-extra';
import { md5 } from './utils/helper';
import { CollectionChain } from 'lodash';

export class GContext extends EventEmitter {
  context = process.cwd();

  dirs = {
    guguRoot: '',
    appDir: '',
    userRoot: '',
    cacheDir: '',
    sourceDir: '',
  };

  db: DB<ggDB.IDB>;
  renderer: marked.Renderer;

  constructor(opts?) {
    super(opts);

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
  }

  async init() {
    // ----------- db
    const db = new DB<ggDB.IDB>(resolve(this.dirs.cacheDir, 'db.json'));
    db.readSync({
      posts: [],
      pages: [],
      categories: [],
      tags: [],
    });
    this.db = db;

    // ----------- renderer
    this.renderer = new marked.Renderer();
    this.renderer.code = (sourceCode, language) => {
      // 处理 mermaid 图表
      if (/^mermaid$/i.test(language)) {
        return `<div class="mermaid">${sourceCode}</div>`;
      }
      const codeResult = !hljs.getLanguage(language)
        ? escapeHtml(sourceCode)
        : hljs.highlight(language, sourceCode).value;
      return `<pre class="hljs language-${language}"><code style="display:block;">${codeResult}</code></pre>`;
    };
    this.renderer.heading = (text: string, level) => {
      const anchorText = `${text}`;
      return `<h${level} id="${anchorText}">${anchorText}<a name="${anchorText}" class="anchor" href="#${anchorText}"></a></h${level}>`;
    };

    await this.loadMarkdownFiles();
    this.db.writeSync();
  }

  private async loadMarkdownFiles() {
    const getPosts = async (type: string) => {
      const results = await glob(`${this.dirs.sourceDir}/${type}/**/*.md`, {});
      const p: Array<
        ReturnType<typeof parseMarkdown> &
          ggDB.IPost & {
            isPost: boolean;
          }
      > = [];
      for await (const mdPath of results) {
        const content = await fs.readFile(mdPath, 'utf-8');
        p.push({
          ...(parseMarkdown(content, this.renderer) as any),
          isPost: type === 'posts',
          filename: mdPath,
        });
      }
      return p;
    };

    const [posts, pages] = await Promise.all(
      ['posts', 'pages'].map((type) => getPosts(type)),
    );

    const all = [...posts, ...pages];

    const allTags: ggDB.ITag[] = [];
    const allCategories: ggDB.ICategory[] = [];

    all.forEach((post) => {
      const { strTags, strCategories } = post;

      if (!post.isPost) {
        post.slug = relative(this.dirs.sourceDir + '/pages', post.filename)
          .replace(/\.md$/i, '')
          .replace(/^\/?/, '/');
        return;
      }

      post.slug = `/post/${post.id}`;

      // 下面仅针对文章进行标签、分类处理
      // handle tags
      post.tags = strTags.map((tagName) => {
        let newItem: ggDB.ITag = allTags.find((it) => it.name === tagName);
        if (!newItem) {
          newItem = {
            id: md5(tagName),
            name: tagName,
            slug: '/tags/' + tagName,
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
            slug: '/categories/' + cName,
            parentId: i === 0 ? '' : md5(strCategories[i - 1]),
            postIds: [],
          };
          allCategories.push(item);
          item.postIds.push(post.id);
          return item;
        }
      });
    });

    [
      ['tags', allTags],
      ['categories', allCategories],
      ['posts', posts],
      ['pages', pages],
    ].forEach(([type, data]: [string, any[]]) => {
      (this.db._.get(type) as CollectionChain<any>).push(...data).commit();
    });
  }
}
