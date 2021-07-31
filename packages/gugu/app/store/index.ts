import { createStore, createLogger } from 'vuex';
import global from './modules/global';
import labels from './modules/labels';
import { IStoreState } from './types';

export function createStoreIns() {
  const store = createStore<IStoreState>({
    modules: {
      global,
      labels,
    },
    strict: !__PROD__,
    plugins: !__PROD__ && !import.meta.env.SSR ? [createLogger()] : [],
    mutations: {
      setState(state, payload) {
        if (typeof payload === 'function') {
          Object.assign(state, payload(state));
        } else {
          Object.assign(state, { ...payload });
        }
      },
    },
  });

  return store;
}
