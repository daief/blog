import { resolve } from 'path';
import type { GContext } from '../ctx';
import { DB } from './db';
import { IListResponse } from '@t/common';

export class GuDao {
  db: DB<ggDB.IDB>;
  private gg: GContext;

  constructor(ctx: GContext) {
    this.gg = ctx;
    const db = new DB<ggDB.IDB>(resolve(ctx.dirs.cacheDir, 'db.json'));
    this.db = db;
  }

  async init() {
    this.db.readSync({
      posts: [],
      pages: [],
      categories: [],
      tags: [],
    });
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
}
