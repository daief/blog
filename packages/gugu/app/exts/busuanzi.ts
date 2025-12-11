import { jsonp } from '@app/app-cmn/jsonp';
import { type IAppState } from '@app/composables/use-app-state';
import { type Router } from 'vue-router';

export interface IBusuanziData {
  site_pv: number;
  page_pv: number;
  site_uv: number;
}

/**
 * 不蒜子统计
 * @see https://busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback_53445250889
 * @returns
 */
function getBusuanzi() {
  return jsonp<IBusuanziData>('//busuanzi.ibruce.info/busuanzi');
}

export async function registerBusuanzi({
  router,
  appState,
}: {
  router: Router;
  appState: IAppState;
}) {
  if (import.meta.env.SSR) return;

  const track = async () => {
    const data = await getBusuanzi().catch(() => null);
    console.log('busuanzi:', data);
    appState.setBusuanzi({
      ...appState.appState.busuanzi!,
      page_pv: data?.page_pv ?? 0,
    });
  };

  track();

  router.afterEach((to, from) => {
    if (to.path !== from.path) {
      track();
    }
  });
}
