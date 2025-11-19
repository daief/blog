import { type Router } from 'vue-router';
import * as NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './nprogress.css';

export async function registerNProgress(router: Router) {
  if (import.meta.env.SSR) return;

  await router.isReady();
  router.beforeEach(async (to, from) => {
    const { matched } = to;

    if (!matched || !matched.length) {
      return;
    }

    let timer: any;

    // 路由守卫
    router.beforeEach((to, from, next) => {
      timer = setTimeout(() => {
        NProgress.start();
      }, 200); // 200ms 以下就不显示 loading 了
      next();
    });

    router.afterEach(() => {
      NProgress.done();
      clearTimeout(timer);
    });
  });
}
