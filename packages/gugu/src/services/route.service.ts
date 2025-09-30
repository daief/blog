import { IRawRoute } from '../../types/index.mts';
import { injectService } from './accessor.ts';
import { MarkdownService } from './markdown.service.ts';

const toBase64 = (str: string) => Buffer.from(str).toString('base64') + '.vue';

export class RouteService {
  @injectService(() => MarkdownService)
  markdownService!: MarkdownService;

  getAllRoutes(): IRawRoute[] {
    const articlePaginations =
      this.markdownService.dataSource.getArticlePaginations();
    return [
      ...articlePaginations.map<IRawRoute>((articles, i) => ({
        vid: toBase64(`/page/${i + 1}`),
        path: `/page/${i + 1}`,
        layout: 'articles',
        data: { articles },
      })),
    ];
  }
}
