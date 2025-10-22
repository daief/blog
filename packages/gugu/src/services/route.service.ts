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
      return this.markdownService.dataSource.articles.value.map<IRawRoute>(
        (it) => {
          const path = `/post/${it.frontmatter.id}`;
          return {
            vid: getVid(path),
            path,
            template: 'article',
            data: {
              article: it,
            },
          };
        },
      );
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
          };
        },
      );
    });

    this.allRoutes = computed(() => {
      return [
        ...this.articlesPaginationRoutes.value,
        ...this.articleRoutes.value,
        ...this.pageRoutes.value,
      ];
    });

    this.allRoutesMap = computed(() => {
      return new Map(this.allRoutes.value.map((it) => [it.vid, it]));
    });
  }
}
