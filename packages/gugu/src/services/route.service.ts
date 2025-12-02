import { IRawRoute, ITemplateType } from '../../types/index.mts';
import { injectService, IServiceCreated } from './accessor.ts';
import { MarkdownService } from './markdown.service.ts';
import { computed, type ComputedRef } from '@vue/reactivity';

const getVid = (str: string) => 'vm:' + str.replace(/\//g, '_') + '.vue';

export class RouteService implements IServiceCreated {
  @injectService(() => MarkdownService)
  markdownService!: MarkdownService;

  articlesPaginationRoutes!: ComputedRef<IRawRoute[]>;
  articleRoutes!: ComputedRef<IRawRoute[]>;
  pageRoutes!: ComputedRef<IRawRoute[]>;
  tagsRoute!: ComputedRef<IRawRoute>;
  tagPaginationRoutes!: ComputedRef<IRawRoute[]>;

  allRoutes!: ComputedRef<IRawRoute[]>;
  allRoutesMap!: ComputedRef<Map<string, IRawRoute>>;

  onCreated() {
    this.articlesPaginationRoutes = computed(() => {
      const articlePaginations =
        this.markdownService.dataSource.getArticlePaginations();
      const arr = articlePaginations.map<IRawRoute>((articles, i) => {
        const path = `/page/${i + 1}`;
        return {
          vid: getVid(path),
          path,
          template: 'articles',
          data: { articles, current: i + 1, total: articlePaginations.length },
        };
      });
      const indexRoute = { ...arr[0] };
      indexRoute.path = '/';
      return [indexRoute, ...arr];
    });

    this.articleRoutes = computed(() => {
      return this.markdownService.dataSource.articles.value
        .filter((it) => it.slug)
        .map<IRawRoute>((it) => {
          const path = it.slug;
          return {
            vid: getVid(path),
            path,
            template: 'article',
            data: {
              article: it,
            },
            meta: {
              frontmatter: it.frontmatter,
              toc: it.toc,
            },
          };
        });
    });

    this.pageRoutes = computed(() => {
      return this.markdownService.dataSource.pages.value.map<IRawRoute>(
        (it) => {
          const path = it.slug;
          return {
            vid: getVid(path),
            path,
            template: 'article',
            data: {
              article: it,
            },
            meta: {
              frontmatter: it.frontmatter,
              toc: it.toc,
            },
          };
        },
      );
    });

    this.tagsRoute = computed(() => {
      const tags = this.markdownService.dataSource.getTags();
      const path = '/tags';
      return {
        vid: getVid(path),
        path: path,
        template: 'tags',
        data: { tags },
      };
    });

    this.tagPaginationRoutes = computed(() => {
      const tags = this.markdownService.dataSource.getTags();
      return tags.flatMap((tagItem) => {
        const tagPaginations =
          this.markdownService.dataSource.getTagPaginations(tagItem.tag);
        const arr = tagPaginations.map<IRawRoute>((articles, i) => {
          const path = `/tags/${tagItem.tag}/${i + 1}`;
          return {
            vid: getVid(path),
            path,
            template: 'tag',
            data: {
              articles,
              current: i + 1,
              total: tagPaginations.length,
              tag: tagItem.tag,
            },
          };
        });
        const indexRoute = { ...arr[0] };
        indexRoute.path = '/tags';
        return [indexRoute, ...arr];
      });
    });

    this.allRoutes = computed(() => {
      return [
        ...this.articlesPaginationRoutes.value,
        ...this.articleRoutes.value,
        ...this.pageRoutes.value,
        this.tagsRoute.value,
        ...this.tagPaginationRoutes.value,
      ];
    });

    this.allRoutesMap = computed(() => {
      return new Map(this.allRoutes.value.map((it) => [it.vid, it]));
    });
  }
}
