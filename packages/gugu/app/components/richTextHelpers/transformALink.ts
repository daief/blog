import { IOption } from './type';

async function getPageAttributesByUrl(url = '') {
  const res = await fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  );
  const resp = await res.json();
  let content = resp.contents;

  const template = document.createElement('template');
  template.innerHTML = content;
  const pageDoc = template.content;

  const metas = Array.from(pageDoc.childNodes)
    .filter((el) => el.nodeName === 'META')
    .map((el: HTMLMetaElement) =>
      Array.from(el.attributes).reduce((res, attr) => {
        res[attr.name] = attr.value;
        return res;
      }, {} as Record<string, string>),
    );

  function getFromMetas(
    key: string,
    valueOfKey: string,
    resultKey = 'content',
  ) {
    try {
      return metas.find((it) => it[key] === valueOfKey)[resultKey] || '';
    } catch (error) {
      return '';
    }
  }

  // 标题：页面 title => meta og:title => markdown 文字
  let title = '';
  try {
    title =
      pageDoc.querySelector('title').textContent ||
      getFromMetas('property', 'og:title');
  } catch (error) {}

  // 描述：meta description => meta og:description => url
  const description =
    getFromMetas('name', 'description') ||
    getFromMetas('property', 'og:description') ||
    '🔗 ' + url;

  // 图片：meta image => meta og:image => 页面中第一个 img 标签 => 网站 icon
  let image = '';
  try {
    image =
      getFromMetas('name', 'image') || getFromMetas('property', 'og:image');

    let tmpEl: any;

    if (!image) {
      tmpEl = pageDoc.querySelector('img');
      tmpEl && (image = tmpEl.getAttribute('data-src') || tmpEl.src);
    }

    if (!image) {
      tmpEl = pageDoc.querySelector('link[rel="icon"]');
      tmpEl && (image = tmpEl.href);
    }
  } catch (error) {}
  image = image || '/images/network-icon.jpeg';

  return {
    title,
    description,
    image,
  };
}

async function handleALink(a: HTMLAnchorElement) {
  let { title, description, image } = await getPageAttributesByUrl(a.href);

  title = title || a.textContent;

  a.innerHTML = `
    <div class="link-text-wrap flex-grow w-0 break-all">
      <div class="text-c-title text-sm mb-0.5 line-clamp-2">
        <span title=${JSON.stringify(title)}>${title}</span>
      </div>
      <div class="text-c-secondary text-xs line-clamp-3">
        <span title=${JSON.stringify(description)}>${description}</span>
      </div>
    </div>
    <img class="block bg-gray-200 w-16 h-16 rounded object-contain ml-3" style="text-indent:-2000em;" src="${image}" />
  `;
  a.setAttribute('data-layout-status', 'complete');
}

// 转换 a 标签为卡片
export function transformALink({ root }: IOption) {
  if (import.meta.env.SSR || !root.value) return;

  const links = Array.from<HTMLAnchorElement>(
    root.value.querySelectorAll('a[data-layout=card]'),
  ).filter((a) => !!a.href);

  let observer: IntersectionObserver;

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            observer.unobserve(entry.target);
            handleALink(entry.target as any);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.5],
      },
    );
    links.forEach((a) => observer.observe(a));
  } else {
    links.forEach((a) => {
      handleALink(a);
    });
  }
  return () => {
    // clean up
    observer && observer.disconnect();
  };
}
