import { debounce } from 'lodash';

// @ts-ignore
// import('viewerjs/dist/viewer.css');
// 样式动态导入暂时有问题：https://github.com/vitejs/vite/issues/3307
import 'viewerjs/dist/viewer.css';
import './viewer.less';

const getViewer = (): Promise<typeof import('viewerjs').default> =>
  import('viewerjs/dist/viewer.min.js').then((m) => m.default);

getViewer();

export function bootstrapViewer() {
  window.addEventListener(
    'click',
    debounce((e) => {
      const el = e.target as HTMLImageElement;
      if (
        el.tagName &&
        el.tagName.toUpperCase() === 'IMG' &&
        el.src &&
        el.classList.contains('post-image')
      ) {
        getViewer().then((Viewer) => {
          const list = Array.from(document.querySelectorAll('img.post-image'))
            .map((it: HTMLImageElement) => it.src)
            .filter(Boolean);
          let rootEl = document.createElement('ul');
          rootEl.innerHTML = list
            .map((it) => `<li><img src="${it}"></li>`)
            .join('');
          const gallery = new Viewer(rootEl, {
            navbar: false,
            initialViewIndex: Math.max(
              list.findIndex((it) => it === el.src),
              0,
            ),
            hide: () => {
              gallery.destroy();
              rootEl.remove();
              rootEl = null;
            },
          });
          gallery.show();
        });
      }
    }),
  );
}
