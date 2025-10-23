import type { ContextService } from '../src/services/context.service.ts';
import type { IBlogConifg } from './config.mts';

declare global {
  var ggContext: ContextService;
  var __BLOG_CONFIG__: IBlogConifg;
}
