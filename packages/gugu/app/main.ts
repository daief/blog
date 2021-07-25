import App from './App.vue';
import { createSSRApp } from 'vue';
import { createRouterIns } from './router';
import { createStoreIns } from './store';
import { createSiteContext } from './utils/siteContext';

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

  app.use(store);
  app.use(router);
  app.use(site);
  return { app, router, store, site };
}
