import App from './App.vue';
import { createSSRApp } from 'vue';
import { createRouterIns } from './router';
import { createStoreIns } from './store';
import { createSiteContext } from './utils/siteContext';
import { createHead } from '@vueuse/head';

export interface ICreateOptions {
  serverState?;
}

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp(opts: ICreateOptions = {}) {
  const app = createSSRApp(App);
  const store = createStoreIns();
  const router = createRouterIns(opts);
  const site = createSiteContext();
  const head = createHead();

  site.router = router;
  site.store = store;

  app.use(store);
  app.use(router);
  app.use(site);
  app.use(head);
  return { app, router, store, site, head };
}
