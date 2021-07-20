import App from './App.vue';
import { createSSRApp } from 'vue';
import { createRouterIns } from './router';
import { createStoreIns } from './store';

// @ts-ignore
globalThis.__SSR__ = import.meta.env.SSR;

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App);
  const router = createRouterIns();
  const store = createStoreIns();

  app.use(store);
  app.use(router);
  return { app, router, store };
}
