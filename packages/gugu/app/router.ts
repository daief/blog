import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  Router,
  RouteRecordRaw,
} from 'vue-router';

import PostPaginationVue from './pages/PostPagination.vue';
import PostDetail from './pages/Post.vue';
import { ROUTER_NAME_ENUM } from './utils/constants';

export function createRouterIns() {
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
