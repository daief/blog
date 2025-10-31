import { ViteSSG } from 'vite-ssg';
import App from './app.vue';
// @ts-ignore
import routes from 'vblog:routes';
import { setup } from '@css-render/vue3-ssr';

import V404 from '@app/views/404.vue';

import 'vfonts/Inter.css';
import 'vfonts/IbmPlexMono.css';
import './styles/main.css';

export const createApp = ViteSSG(
  App as any,
  {
    routes: [
      ...routes,
      {
        path: '/:catchAll(.*)',
        component: V404,
        meta: {
          layoutClass: 'flex-center',
        },
      },
    ],
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
  },
  ({ app, initialState }) => {
    if (import.meta.env.SSR) {
      const { collect } = setup(app);
      initialState.naiveUiStyles = collect();
    }
  },
);
