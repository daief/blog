import axios from 'axios';
import { App, inject } from 'vue';

const key = Symbol('siteContext');

export function createSiteContext(): ISiteContext & {
  install: (app: App) => void;
} {
  const siteCtx: ISiteContext = {
    axios: axios.create(),
    blogConfig: __INJECTED_USER_CONFIG__,
  };

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
