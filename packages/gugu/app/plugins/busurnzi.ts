import { jsonp } from '@app/api/jsonp';
import { IStoreState } from '@app/store/types';

/**
 * 不蒜子统计
 * @see https://busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback_53445250889
 * @returns
 */
function getBusuanzi() {
  return jsonp<{
    site_pv: number;
    page_pv: number;
    site_uv: number;
  }>('//busuanzi.ibruce.info/busuanzi');
}

export function bootstrapBusuanzi(site: ISiteContext) {
  const track = () => {
    site.store.commit('setState', (pre: IStoreState) => {
      pre.global.site.page_pv = 0;
    });
    return getBusuanzi()
      .then((res) => {
        site.store.commit('global/setState', (pre: IStoreState['global']) => {
          Object.assign(pre.site, {
            ...res,
          });
        });
      })
      .catch(() => {
        site.store.commit('global/setState', (pre: IStoreState['global']) => {
          pre.site.page_pv = 0;
        });
      });
  };

  track();

  site.router.afterEach((to, from) => {
    if (to.path !== from.path) {
      track();
    }
  });
}
