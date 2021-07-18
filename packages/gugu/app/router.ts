import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  Router,
  RouteRecordRaw,
} from 'vue-router';

import PostPaginationVue from './pages/PostPagination.vue';

export function createRouterIns() {
  const routes: RouteRecordRaw[] = [
    {
      name: 'home',
      path: '/',
      component: PostPaginationVue,
    },
    {
      name: 'postPagination',
      path: '/page/:no',
      component: PostPaginationVue,
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
