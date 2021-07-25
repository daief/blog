import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  Router,
  RouteRecordRaw,
} from 'vue-router';
import type { ICreateOptions } from './main';

import PostPaginationVue from './pages/PostPagination.vue';
import PostDetail from './pages/Post.vue';
import SimplePage from './pages/SimplePage.vue';

import { ROUTER_NAME_ENUM } from './utils/constants';

function getSimplePageRouteCfg(cfg: Partial<RouteRecordRaw>): RouteRecordRaw {
  return {
    name: '',
    path: '',
    ...(cfg as any),
    component: SimplePage,
  };
}

export function createRouterIns(opts: ICreateOptions) {
  const routes: RouteRecordRaw[] = [
    {
      name: ROUTER_NAME_ENUM.home,
      path: '/',
      component: PostPaginationVue,
    },
    {
      name: ROUTER_NAME_ENUM.postPagination,
      path: '/page/:no',
      component: PostPaginationVue,
    },
    {
      name: ROUTER_NAME_ENUM.postDetail,
      path: '/post/:id',
      component: PostDetail,
    },
  ];

  const state = import.meta.env.SSR
    ? opts.serverState
    : window.__INITIAL_STATE__;

  console.log({
    state,
    a: typeof window !== 'undefined' && window.__INITIAL_STATE__,
  });

  state.global.simplePages.forEach((it) => {
    routes.push(
      getSimplePageRouteCfg({
        name: it.path,
        path: it.path,
      }),
    );
  });

  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (to.hash) {
        return {
          el: to.hash,
        };
      }

      if (savedPosition) {
        return savedPosition;
      }

      return { top: 0 };
    },
  });

  return router;
}
