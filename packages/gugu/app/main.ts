import { ViteSSG } from 'vite-ssg';
import App from './app.vue';
// @ts-ignore
import routes from 'vblog:routes';
import { setup } from '@css-render/vue3-ssr';

import V404 from '@app/views/404.vue';

// import 'vfonts/Inter.css';
// import 'vfonts/IbmPlexMono.css';
import './styles/main.css';
import { registerGoogleAnalytics } from './exts/ga';
import { registerNProgress } from './exts/nprogress';
import { registerBusuanzi } from './exts/busuanzi';
import { useAppState } from './composables/use-app-state';

export const createApp = ViteSSG(
  App as any,
  {
    routes: [
      ...routes,
      {
        path: '/404',
        component: V404,
        meta: {
          layoutClass: 'flex-center',
        },
      },
      {
        path: '/:catchAll(.*)',
        component: V404,
        meta: {
          layoutClass: 'flex-center',
        },
      },
    ],
    scrollBehavior(to, _from, savedPosition) {
      if (savedPosition) {
        return savedPosition;
      }

      if (to.hash) {
        return {
          el: to.hash,
        };
      }

      return { top: 0 };
    },
  },
  ({ app, initialState, router }) => {
    if (import.meta.env.SSR) {
      const { collect } = setup(app);
      initialState.naiveUiStyles = collect();
    }

    registerGoogleAnalytics(router);
    registerNProgress(router);
    registerBusuanzi({ router, appState: useAppState() });
  },
);
