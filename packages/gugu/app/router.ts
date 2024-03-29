import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  RouteRecordRaw,
} from 'vue-router';
import type { ICreateOptions } from './main';

import PostPaginationVue from '@app/pages/PostPagination.vue';
import PostDetail from '@app/pages/Post.vue';
import SimplePage from '@app/pages/SimplePage.vue';
import Tags from '@app/pages/Tags.vue';
import TagsPostPagination from '@app/pages/TagsPostPagination.vue';

import Categories from '@app/pages/Categories.vue';
import CategoriesPostPagination from '@app/pages/CategoriesPostPagination.vue';

import Page404 from '@app/pages/404.vue';

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
    {
      name: ROUTER_NAME_ENUM.tags,
      path: '/tags',
      // TODO asyncData 暂不支持异步组件
      // component: () => import('@app/pages/Tags.vue'),
      component: Tags,
    },
    {
      name: ROUTER_NAME_ENUM.tagsPostPagination,
      path: '/tags/:tag/:no',
      component: TagsPostPagination,
    },
    {
      path: '/tags/:tag',
      redirect: (to) => ({
        ...to,
        name: ROUTER_NAME_ENUM.tagsPostPagination,
        params: {
          ...to.params,
          no: 1,
        },
      }),
    },
    {
      name: ROUTER_NAME_ENUM.category,
      path: '/categories',
      component: Categories,
    },
    {
      name: ROUTER_NAME_ENUM.categoryPostPagination,
      path: '/categories/:category/:no',
      component: CategoriesPostPagination,
    },
    {
      path: '/categories/:category',
      redirect: (to) => ({
        ...to,
        name: ROUTER_NAME_ENUM.categoryPostPagination,
        params: {
          ...to.params,
          no: 1,
        },
      }),
    },
  ];

  const state = import.meta.env.SSR
    ? opts.serverState
    : window.__INITIAL_STATE__;

  state.global.simplePages.forEach((it) => {
    routes.push(
      getSimplePageRouteCfg({
        name: it.path,
        path: it.path,
        meta: {
          isSimplePage: true,
        },
      }),
    );
  });

  routes.push({
    name: ROUTER_NAME_ENUM.page404,
    path: '/:pathMatch(.*)*',
    component: Page404,
  });

  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
    scrollBehavior(to, _from, savedPosition) {
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
