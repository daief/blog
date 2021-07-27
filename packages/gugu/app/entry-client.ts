import { createApp } from './main';
import '@gugu-highlight-theme';
import NProgress from 'nprogress';

import './styles';

const apps = createApp();
const { app, router, store, site } = apps;

// @ts-ignore
window.___APP___ = apps;

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

    let timer: any;
    try {
      timer = setTimeout(() => {
        NProgress.start();
      }, 200); // 200ms 以下就不显示 loading 了
      await Promise.all(
        matched.map((it) => {
          const C: any = it.components.default;
          if (typeof C.asyncData !== 'function') return;
          return C.asyncData({
            store,
            route: to,
            fromRoute: from,
            site,
            router,
          });
        }),
      );
    } catch (error) {
      console.warn('asyncData 出错了：', error);

      throw error;
    } finally {
      NProgress.done();
      clearTimeout(timer);
    }
  });

  app.mount('#app', true);
});

// google ga
// @ts-ignore
window.dataLayer = window.dataLayer || [];
function gtag(...args: any[]) {
  // @ts-ignore
  dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'UA-146082840-1');

router.afterEach(function (to) {
  // @ts-ignore
  window.gtag('config', 'UA-146082840-1', {
    page_path: to.fullPath,
    type_os: 'web',
  });
});
