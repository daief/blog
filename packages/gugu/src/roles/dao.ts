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
      categories: [],
      tags: [],
    });
    this.db.writeSync();
  }

  getAvailablePosts() {
    if (this.gg.command === 'dev') {
      // 允许草稿
      return this.db._.get('posts')
        .filter((it) => it.isArticle)
        .value();
    }
    return this.db._.get('posts')
      .filter((it) => it.isArticle && it.published)
      .value();
  }

  /**
   * 获取站点基本信息
   * @returns
   */
  getSiteInfo() {
    return {
      postCount: this.getAvailablePosts().length,
      tagCount: this.db._.get('tags').size(),
      categoryCount: this.db._.get('categories').size(),
    };
  }

  /**
   * 获取已发布文章列表
   * @param data
   * @returns
   */
  getPostList(data: {
    current?: number;
    pageSize?: number;
    tag?: string;
    category?: string;
  }): IListResponse<ggDB.IPost> {
    const { current = 1, pageSize = 10, tag = '', category = '' } = data;
    let posts = this.getAvailablePosts();

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

  /**
   * 根据 id 查询文章详情
   * @param data
   * @returns
   */
  getPostDetail(data: { id: string }) {
    const posts = this.getAvailablePosts();

    const index = posts.findIndex((it) => it.id === data.id);

    if (index < 0) {
      return null;
    }

    const post = this.sortPostVO(posts[index], false);
    post.next = posts[index - 1] ? this.sortPostVO(posts[index - 1]) : null;
    post.prev = posts[index + 1] ? this.sortPostVO(posts[index + 1]) : null;

    return post;
  }

  /**
   * 根据路径查询普通页面的内容
   * @param pagePath
   * @returns
   */
  getSimpleContentByPath(pagePath: string): ggDB.IPost {
    const res = this.db._.get('posts')
      .find((it) => it.path === pagePath)
      .value();
    return res ? this.sortPostVO(res, false) : null;
  }

  /**
   * 获取普通页面的列表
   * @returns
   */
  getSimplePages() {
    const posts = this.db._.get('posts')
      .filter((it) => !it.isArticle)
      .value();
    return posts.map((p) => this.sortPostVO(p));
  }

  getTagList(): ggDB.ITag[] {
    return this.db._.get('tags')
      .value()
      .map((it) => this.sortTagVO(it));
  }

  getCategoryList(): ggDB.ICategory[] {
    return this.db._.get('categories')
      .value()
      .map((it) => this.sortCategoryVO(it));
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
      tags: post.tags.map((it) => this.sortTagVO(it)),
      categories: post.categories.map((cat) => this.sortCategoryVO(cat)),
      min2read: post.min2read,
      wordCount: post.wordCount,
      excerpt: post.excerpt,
      more: post.more,
      hash: post.hash,
      isArticle: post.isArticle,
      sort: post.sort,
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

  private sortTagVO(tag: ggDB.ITag): ggDB.ITag {
    const result: ggDB.ITag = {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      path: tag.path,
      postCount: tag.postIds.length,
      postIds: [],
    };

    return result;
  }

  private sortCategoryVO(cat: ggDB.ICategory): ggDB.ICategory {
    const result: ggDB.ICategory = {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      path: cat.path,
      parentId: cat.parentId,
      postCount: cat.postIds.length,
      postIds: [],
    };

    return result;
  }
}
