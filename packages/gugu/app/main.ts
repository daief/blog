import { ViteSSG } from 'vite-ssg';
import App from './app.vue';
// @ts-ignore
import routes from 'vblog:routes';
import { setup } from '@css-render/vue3-ssr';

import 'vfonts/Lato.css';
import 'vfonts/FiraCode.css';
import './styles/main.css';

export const createApp = ViteSSG(
  App,
  {
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
  },
  ({ app, initialState }) => {
    // @ts-expect-error
    if (import.meta.env.SSR) {
      const { collect } = setup(app);
      initialState.naiveUiStyles = collect();
    }
  },
);
