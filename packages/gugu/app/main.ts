import { ViteSSG } from 'vite-ssg';
import App from './app.vue';
// @ts-ignore
import routes from 'vblog:routes';

console.log('🚀 ~ main.ts:5 ~ routes:', routes);

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
  ({ app }) => {},
);
