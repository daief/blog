import { IRawRoute } from '../../types/index.mts';
import { injectService, IServiceCreated } from './accessor.ts';
import { MarkdownService } from './markdown.service.ts';
import { computed, type ComputedRef } from '@vue/reactivity';

const getVid = (str: string) => Buffer.from(str).toString('base64') + '.vue';

export class RouteService implements IServiceCreated {
  @injectService(() => MarkdownService)
  markdownService!: MarkdownService;

  allRoutes!: ComputedRef<IRawRoute[]>;

  onCreated() {
    this.allRoutes = computed(() => {
      const articlePaginations =
        this.markdownService.dataSource.getArticlePaginations();
      return [
        ...articlePaginations.map<IRawRoute>((articles, i) => ({
          vid: getVid(`/page/${i + 1}`),
          path: `/page/${i + 1}`,
          layout: 'articles',
          data: { articles },
        })),
      ];
    });
  }

  getAllRoutes(): IRawRoute[] {
    return this.allRoutes.value;
  }
}
