export async function getPageAttributesByUrl(url = '') {
  const res = await fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  );
  const resp = await res.json();
  let content = resp.contents;

  const template = document.createElement('template');
  template.innerHTML = content;
  const pageDoc = template.content;

  const metas = Array.from(pageDoc.childNodes)
    .filter((el): el is HTMLMetaElement => el.nodeName === 'META')
    .map((el: HTMLMetaElement) =>
      Array.from(el.attributes).reduce<Record<string, string>>((res, attr) => {
        res[attr.name] = attr.value;
        return res;
      }, {}),
    );

  function getFromMetas(
    key: string,
    valueOfKey: string,
    resultKey = 'content',
  ) {
    const target = metas.find((it) => it[key] === valueOfKey);
    return target?.[resultKey] || '';
  }

  // 标题：页面 title => meta og:title => markdown 文字
  let title =
    pageDoc.querySelector('title')?.textContent ||
    getFromMetas('property', 'og:title');

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

    if (image) {
      image = new URL(image, url).href;
    }
  } catch (error) {}

  template.remove();

  return {
    title,
    description,
    image,
  };
}
