import { debounce } from 'lodash';

// @ts-ignore
import('viewerjs/dist/viewer.css');
import('viewerjs');

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
        import('viewerjs').then((m) => {
          const list = Array.from(document.querySelectorAll('img.post-image'))
            .map((it: HTMLImageElement) => it.src)
            .filter(Boolean);
          let rootEl = document.createElement('ul');
          rootEl.innerHTML = list
            .map((it) => `<li><img src="${it}"></li>`)
            .join('');
          const gallery = new m.default(rootEl, {
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
