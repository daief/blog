import type { ContextService } from '../src/services/context.service.ts';

declare global {
  var ggContext: ContextService;
}
