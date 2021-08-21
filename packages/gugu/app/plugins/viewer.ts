import { debounce } from 'lodash';

// @ts-ignore
import('viewerjs/dist/viewer.css');
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
          const list = Array.from<HTMLImageElement>(
            document.querySelectorAll('img.post-image'),
          )
            .filter((it) => it.src)
            .map((it) => ({
              src: it.src,
              html: it.outerHTML,
            }));
          let rootEl = document.createElement('ul');

          rootEl.innerHTML = list.map((it) => `<li>${it.html}</li>`).join('');
          // 避免一次性全都加载
          Array.from(rootEl.getElementsByTagName('img')).forEach((img) => {
            img.setAttribute('data-src', img.src);
            img.src = '/images/loading.gif';
          });

          const gallery = new Viewer(rootEl, {
            navbar: false,
            initialViewIndex: Math.max(
              list.findIndex((it) => it.src === el.src),
              0,
            ),
            url: 'data-src',
            inheritedAttributes: [
              'crossOrigin',
              'decoding',
              'isMap',
              'referrerPolicy',
              'sizes',
              'srcset',
              'useMap',
            ],
            hidden: () => {
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
