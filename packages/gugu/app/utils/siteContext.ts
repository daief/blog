import { App, inject } from 'vue';

const key = Symbol('siteContext');

export function createSiteContext(siteCtx: ISiteContext): ISiteContext & {
  install: (app: App) => void;
} {
  Object.defineProperty(siteCtx, 'install', {
    get() {
      return function (app: App) {
        app.config.globalProperties.$site = siteCtx;
        app.provide(key, siteCtx);
      };
    },
  });
  return siteCtx as any;
}

export function useSiteContext(): ISiteContext {
  return inject(key)!;
}
