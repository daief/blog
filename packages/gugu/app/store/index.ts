import { createStore, createLogger } from 'vuex';
import global from './modules/global';
import tags from './modules/tags';

export function createStoreIns() {
  const store = createStore({
    modules: {
      global,
      tags,
    },
    strict: !__PROD__,
    plugins: !__PROD__ && !import.meta.env.SSR ? [createLogger()] : [],
  });

  return store;
}
