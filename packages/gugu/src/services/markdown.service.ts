import { ILogger, injectLogger } from '../utils/logger.mts';
import { ContextService } from './context.service.ts';
import { getService, injectService } from './accessor.ts';
import { createRenderer, IGMarkerd, readUntilMore } from '../utils/md.mts';
import plimit from 'p-limit';
import { IMarkdown } from '../../types/index.mts';
import fs from 'fs-extra';
import * as glob from 'glob';
import { FileService } from './file.service.ts';
import { normalizePath } from 'vite';
import * as fm from 'front-matter';
import { ensureArray } from '../utils/misc.mts';
import { ref, computed } from '@vue/reactivity';

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
        const sortDiff = b.frontmatter.sort - a.frontmatter.sort;
        if (sortDiff !== 0) {
          return sortDiff;
        }
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

  readonly dataSource = new DataSource();

  @injectService(() => FileService)
  fileService!: FileService;

  md!: IGMarkerd;

  async init() {
    this.md = createRenderer();
    await this.loadMds();

    this.fileService.watcher
      .on('add', async (filepath) => {
        this.dataSource.update(
          await this.loadMd(normalizePath(filepath), true),
        );
      })
      .on('change', async (filepath) => {
        console.log('🚀 ~ markdown.service.ts:132 ~ filepath:', filepath);

        this.dataSource.update(
          await this.loadMd(normalizePath(filepath), true),
        );
      })
      .on('unlink', (filepath) => {
        this.dataSource.remove(normalizePath(filepath));
      });
  }

  private async loadMds() {
    const files = await glob.glob(
      `${this.fileService.resolveSource()}/**/*.md`,
      {
        nodir: true,
        absolute: true,
      },
    );
    const limit = plimit(10);

    const list: IMarkdown[] = [];
    const tasks = files.map(async (filepath) =>
      limit(async () => {
        const meta = await this.loadMd(normalizePath(filepath));
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
  private async loadMd(filepath: string, all = false): Promise<IMarkdown> {
    const fileContent = all
      ? await fs.readFile(filepath, 'utf-8')
      : await readUntilMore(filepath);
    const matterResult = fm.default<any>(fileContent);
    const frontmatter = matterResult.attributes as Omit<
      IMarkdown['frontmatter'],
      'tags'
    > & { tags: string[] | string };
    const { sort, tags, ...rest } = frontmatter;

    const [excerpt, more = ''] = this.md!.gParse(matterResult.body, {}).split(
      '<!-- more -->',
    );

    return {
      type: this.fileService.isArticle(filepath) ? 'article' : 'page',
      isDraft: this.fileService.isDraft(filepath),
      filepath,
      rawContent: matterResult.body,
      excerpt,
      more,
      frontmatter: {
        ...rest,
        tags: ensureArray(tags),
        sort: Number.isFinite(sort) ? sort : 0,
      },
    };
  }
}
