import { createStore, createLogger } from 'vuex';
import global from './modules/global';

export function createStoreIns() {
  return createStore({
    modules: {
      global,
    },
    strict: !__PROD__,
    plugins: !__PROD__ && !import.meta.env.SSR ? [createLogger()] : [],
  });
}
