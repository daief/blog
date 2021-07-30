import { createApp } from './main';
import '@gugu-highlight-theme';
import NProgress from 'nprogress';
import './styles';
import { bootstrapViewer } from './plugins/viewer';
import { bootstrapBusuanzi } from './plugins/busurnzi';

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

  // plugins
  bootstrapViewer();
  bootstrapBusuanzi(site);
});
