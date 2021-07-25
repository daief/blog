import { createApp } from './main';
import '@gugu-highlight-theme';
import NProgress from 'nprogress';

import './styles';

const { app, router, store, site } = createApp();

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
  router.beforeEach(async (to, from) => {
    const { matched } = to;

    if (!matched || !matched.length) {
      return;
    }

    try {
      NProgress.start();
      await Promise.all(
        matched.map((it) => {
          const C: any = it.components.default;
          if (typeof C.asyncData !== 'function') return;
          return C.asyncData({ store, route: to, fromRoute: from, site });
        }),
      );
    } catch (error) {
      console.warn('asyncData 出错了：', error);
    }
    NProgress.done();
  });

  app.mount('#app');
});