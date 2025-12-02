import { ILogger, injectLogger } from '../utils/logger.mts';
import { injectService } from './accessor.ts';
import { readUntil, renderMarkdown } from '../utils/md.mts';
import plimit from 'p-limit';
import { IMarkdown } from '../../types/index.mts';
import fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import { FileService } from './file.service.ts';
import { normalizePath } from 'vite';
import * as fm from 'front-matter';
import { ensureArray } from '../utils/misc.mts';
import { ref, computed } from '@vue/reactivity';
import { ConfigService } from './config.service.ts';

class DataSource {
  @injectLogger('[DataSource]')
  private readonly logger!: ILogger;

  private markdownMap = ref(new Map<string, IMarkdown>());
  private pageSize = 10;

  readonly articles = computed(() => {
    const allMds = Array.from(this.markdownMap.value.values());
    const articles: IMarkdown[] = [];
    for (const md of allMds) {
      if (md.type === 'article') {
        articles.push(md);
      }
    }

    return articles
      .map((it) => {
        if (!it.frontmatter.date) {
          this.logger.warn(
            `[${it.filepath}] no date in frontmatter, use 1970-01-01 as default`,
          );
          it.frontmatter.date = new Date(0);
        }
        return it;
      })
      .sort((a, b) => {
        // 优先置顶草稿
        const isSameDraft = a.frontmatter.draft === b.frontmatter.draft;
        if (!isSameDraft) {
          return b.frontmatter.draft ? 1 : -1;
        }

        // 再基于 sort 排序
        const sortDiff = b.frontmatter.sort - a.frontmatter.sort;
        if (sortDiff !== 0) {
          return sortDiff;
        }

        // 最后基于时间
        const dateDiff =
          b.frontmatter.date.valueOf() - a.frontmatter.date.valueOf();
        return dateDiff;
      });
  });

  readonly pages = computed(() => {
    const allMds: IMarkdown[] = Array.from(this.markdownMap.value.values());
    return allMds.filter((md) => md.type === 'page');
  });

  readonly tagMap = computed(() => {
    const map = new Map<string, IMarkdown[]>();
    for (const post of this.articles.value) {
      for (const tag of post.frontmatter.tags) {
        if (!map.has(tag)) {
          map.set(tag, []);
        }
        map.get(tag)?.push(post);
      }
    }
    return map;
  });

  setData(data: IMarkdown[]) {
    this.markdownMap.value = new Map(data.map((item) => [item.filepath, item]));
  }

  update(post: IMarkdown) {
    this.markdownMap.value.set(post.filepath, post);
  }

  remove(filepath: string) {
    return this.markdownMap.value.delete(filepath);
  }

  getArticlePaginations() {
    return this.paginate(this.articles.value);
  }

  getTagPaginations(tag: string) {
    return this.paginate(this.tagMap.value.get(tag) || []);
  }

  getTags() {
    return Array.from(this.tagMap.value.entries())
      .map(([tag, posts]) => ({ tag, posts: posts.length }))
      .sort((a, b) => b.posts - a.posts);
  }

  get(filepath: string) {
    return this.markdownMap.value.get(filepath);
  }

  private paginate(arr: IMarkdown[]) {
    const pages = Math.ceil(arr.length / this.pageSize);
    return Array.from({ length: pages }).map((_, idx) => {
      const page = idx + 1;
      return arr.slice((page - 1) * this.pageSize, page * this.pageSize);
    });
  }
}

export class MarkdownService {
  @injectLogger('[MarkdownService]')
  private readonly logger!: ILogger;

  @injectService(() => ConfigService)
  private readonly configService!: ConfigService;

  readonly dataSource = new DataSource();

  @injectService(() => FileService)
  fileService!: FileService;

  async init() {
    await this.loadMds();

    this.fileService.watcher
      ?.on('add', async (filepath) => {
        this.dataSource.update(
          await this.loadMd(normalizePath(filepath), 'all'),
        );
      })
      .on('change', async (filepath) => {
        this.dataSource.update(
          await this.loadMd(normalizePath(filepath), 'all'),
        );
      })
      .on('unlink', (filepath) => {
        this.dataSource.remove(normalizePath(filepath));
      });

    this.logger.info('ready');
  }

  private async loadMds() {
    let files = await glob.glob(`${this.fileService.resolveSource()}/**/*.md`, {
      nodir: true,
      absolute: true,
    });
    const limit = plimit(10);

    const list: IMarkdown[] = [];
    const tasks = files.map(async (filepath) =>
      limit(async () => {
        // TODO 先读取部分，按需全文
        const meta = await this.loadMd(normalizePath(filepath), 'all');
        if (meta.frontmatter.draft && !this.configService.IsDev) {
          return;
        }

        list.push(meta);
      }),
    );
    await Promise.all(tasks);
    this.dataSource.setData(list);
  }

  /**
   * 单文件加载
   * @param filepath
   * @returns
   */
  private async loadMd(
    filepath: string,
    sizeType: 'all' | 'meta' | 'more' = 'meta',
  ): Promise<IMarkdown> {
    const fileContent =
      sizeType === 'all'
        ? await fs.readFile(filepath, 'utf-8')
        : await readUntil(
            filepath,
            sizeType === 'more' ? undefined : '---',
            sizeType === 'more' ? undefined : 2,
          );

    const matterResult = fm.default<any>(fileContent);
    const frontmatter = matterResult.attributes as Omit<
      IMarkdown['frontmatter'],
      'tags'
    > & { tags: string[] | string };
    const { sort, tags, ...rest } = frontmatter;

    const { html: mdHtml, headings: toc } = !matterResult.body
      ? { html: '', headings: [] }
      : await renderMarkdown(matterResult.body, {
          filepath,
          transformImgSrc: (imgSrc) => {
            const isAbs = ['http', '//', 'data:'].some((prefix) =>
              imgSrc.startsWith(prefix),
            );
            if (isAbs) return imgSrc;

            const sourceRoot = this.fileService.resolveSource();
            const fileDir = path.dirname(filepath);
            const imageAbsPath = path.resolve(fileDir, imgSrc);

            if (imageAbsPath.startsWith(sourceRoot)) {
              const relativeToSource = path.relative(sourceRoot, imageAbsPath);
              return `@source/${relativeToSource.replace(/\\/g, '/')}`;
            }

            return imgSrc;
          },
          /** 处理 markdown 内部链接 */
          transformLinkHref: async (href) => {
            if (href && !href.startsWith('http') && href.endsWith('.md')) {
              const targetFile = normalizePath(
                path.resolve(path.dirname(filepath), href),
              );
              const md = await this.getMdByPath(targetFile);
              return md!.slug;
            }
            return href;
          },
        });
    const [excerpt, more = ''] = mdHtml.split('<!-- more -->');
    const type = this.fileService.isArticle(filepath) ? 'article' : 'page';
    const isArticle = type === 'article';

    let slug = '';
    if (type === 'page') {
      slug =
        '/' +
        normalizePath(
          path.relative(this.fileService.resolveSource(), filepath),
        ).replace(/\.md$/, '');
    } else if (isArticle && rest.id) {
      slug = `/post/${rest.id}`;
    }

    return {
      type,
      slug,
      filepath,
      rawContent: matterResult.body,
      excerpt,
      more,
      toc,
      frontmatter: {
        ...rest,
        tags: ensureArray(tags),
        sort: Number.isFinite(sort) ? sort : 0,
        comments: rest.comments ?? isArticle,
        draft: rest.draft ?? false,
      },
    };
  }

  private async getMdByPath(filepath: string) {
    const md = this.dataSource.get(filepath);
    if (md) return md;

    this.dataSource.update(await this.loadMd(normalizePath(filepath), 'meta'));
    return this.dataSource.get(filepath);
  }
}
