import axios from 'axios';
import { createApp } from './main';
import { createSiteContext } from './utils/siteContext';
import './styles';

const axiosIns = axios.create();

const { app, router, store } = createApp();
const site = createSiteContext({
  axios: axiosIns,
});
app.use(site);

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__);
}

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
  router.beforeEach(async (to, from) => {
    const { matched } = to;
    await Promise.all(
      matched.map((it) => {
        const C: any = it.components.default;
        if (typeof C.asyncData !== 'function') return;
        return C.asyncData({ store, route: to, fromRoute: from, site });
      }),
    );
  });

  app.mount('#app');
  console.log(router.currentRoute.value.matched);
});
