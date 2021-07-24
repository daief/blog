import glob from 'glob-promise';
import { CollectionChain } from 'lodash';
import { relative, resolve, join } from 'path';
import type { GContext } from '../ctx';
import { md5 } from '../utils/helper';
import { parseMarkdown } from '../utils/parseMarkdown';
import { DB } from './db';
import fs from 'fs-extra';
import { IListResponse } from '@t/common';
import dayjs from 'dayjs';

export class GuDao {
  private db: DB<ggDB.IDB>;
  private gg: GContext;

  resolvingMarkdown: {
    filename: string;
    id: string;
  };

  constructor(ctx: GContext) {
    this.gg = ctx;
    const db = new DB<ggDB.IDB>(resolve(ctx.dirs.cacheDir, 'db.json'));
    db.readSync({
      posts: [],
      pages: [],
      categories: [],
      tags: [],
    });
    this.db = db;
  }

  async init() {
    await this.loadMarkdownFiles();
    await this.loadAssets();
    this.db.writeSync();
  }

  /**
   * 获取站点基本信息
   * @returns
   */
  getSiteInfo() {
    return {
      postCount: this.db._.get('posts').size(),
      tagCount: this.db._.get('tags').size(),
      categoryCount: this.db._.get('categories').size(),
    };
  }

  getPostList(data: {
    current?: number;
    pageSize?: number;
    tag?: string;
    category?: string;
  }): IListResponse<ggDB.IPost> {
    const { current = 1, pageSize = 10, tag = '', category = '' } = data;
    let posts = this.db._.get('posts')
      .filter((it) => it.published)
      .value();

    if (tag) {
      posts = posts.filter((it) => it.tags.some((tagVo) => tagVo.name === tag));
    }
    if (category) {
      posts = posts.filter((it) =>
        it.categories.some((caVo) => caVo.name === category),
      );
    }
    return {
      current,
      pageSize,
      totalPages: Math.ceil(posts.length / pageSize),
      result: posts
        .slice((current - 1) * pageSize, current * pageSize)
        .map((it) => this.sortPostVO(it)),
    };
  }

  getPostDetail(data: { id: string }) {
    const posts = this.db._.get('posts')
      .filter((it) => it.published)
      .value();

    const index = posts.findIndex((it) => it.id === data.id);

    if (index < 0) {
      return null;
    }

    const post = this.sortPostVO(posts[index], false);
    post.next = posts[index - 1] ? this.sortPostVO(posts[index - 1]) : null;
    post.prev = posts[index + 1] ? this.sortPostVO(posts[index + 1]) : null;

    return post;
  }

  private sortPostVO(post: ggDB.IPost, isSimple = true): ggDB.IPost {
    const result: ggDB.IPost = {
      id: post.id,
      slug: post.slug,
      path: post.path,
      title: post.title,
      comments: post.comments,
      published: post.published,
      date: post.date,
      updated: post.updated,
      tags: post.tags,
      categories: post.categories,
      min2read: post.min2read,
      wordCount: post.wordCount,
      excerpt: post.excerpt,
      more: post.more,
      tocHtml: post.tocHtml,
      hash: post.hash,
      filename: '',
      raw: '',
      prev: null,
      next: null,
    };

    if (isSimple) {
      Object.assign(result, {
        more: '',
        tocHtml: '',
      });
    }

    return result;
  }

  private async loadMarkdownFiles() {
    const getPosts = async (type: 'posts' | 'pages') => {
      const results = await glob(
        `${this.gg.dirs.sourceDir}/${type}/**/*.md`,
        {},
      );
      const p: Array<
        ReturnType<typeof parseMarkdown> &
          ggDB.IPost & {
            isPost: boolean;
          }
      > = [];
      for await (const mdPath of results) {
        const content = await fs.readFile(mdPath, 'utf-8');
        const hash = md5(content);

        this.resolvingMarkdown = {
          filename: mdPath,
          id: '',
        };
        // id 在 parseMarkdown 方法中赋值
        const parsedResult = this.gg.parseMarkdown(content);

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
      (this.db._.get(type) as CollectionChain<any>).push(...data).commit();
    });
  }

  private async loadAssets() {
    for (const [id, assetInfoLs] of this.gg.assets) {
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
}
