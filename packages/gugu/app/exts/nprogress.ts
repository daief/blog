import { type Router } from 'vue-router';
import * as NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './nprogress.css';

export async function registerNProgress(router: Router) {
  if (import.meta.env.SSR) return;

  await router.isReady();

  let timer: any;
  router.beforeEach((to, from, next) => {
    // 200ms 以下就不显示 loading 了
    timer = setTimeout(() => NProgress.start(), 200);
    next();
  });

  router.afterEach(() => {
    NProgress.done();
    clearTimeout(timer);
  });
}
