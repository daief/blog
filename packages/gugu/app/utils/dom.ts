export type ITocItem = {
  name: string;
  id: string;
  level: number;
  children?: ITocItem[];
};

export function getContentTocFromEl(el: HTMLElement): ITocItem[] {
  if (!el) return [];

  const ls: ITocItem[] = [];
  function insertItemToTree(it: ITocItem, subarr: ITocItem[]): boolean {
    if (!subarr.length) {
      subarr.push(it);
      return true;
    }
    for (let index = subarr.length - 1; index >= 0; index--) {
      const element = subarr[index];
      if (element.level > it.level) {
        continue;
      }

      if (element.level === it.level) {
        subarr.push(it);
        return true;
      }

      element.children = element.children || [];
      if (insertItemToTree(it, element.children)) {
        return true;
      }
    }

    return false;
  }

  Array.from(el.childNodes).forEach((it: HTMLElement) => {
    if (!/^H\d$/i.test(it.tagName)) return;
    const id = it.getAttribute('id');
    if (!id) return;

    const level = +it.tagName.slice(1);
    insertItemToTree(
      {
        level,
        name: it.textContent,
        id,
      },
      ls,
    );
  });

  return ls;
}

export function createTocHtmlStrByList(list: ITocItem[]) {
  if (!list || !list.length) return '';

  function walkIn(it: ITocItem, index: number, parentOrder: string) {
    const currentOrder = parentOrder
      ? `${parentOrder}.${index + 1}`
      : String(index + 1);

    const childrenStr =
      it.children && it.children.length
        ? `<ol class="nav-child">
            ${it.children.map((_, i) => walkIn(_, i, currentOrder)).join('\n')}
          </ol>`
        : '';

    const fra = `
      <li class="nav-item">
        <a href="#${it.id}" class="nav-link">
          <span class="nav-number">${currentOrder}</span>
          <span class="nav-text">${it.name}</span>
        </a>
        ${childrenStr}
      </li>
    `;
    return fra;
  }

  const inner = list
    .map((it, i) => {
      return walkIn(it, i, '');
    })
    .join('\n');

  return `
    <nav>
      <ol>${inner}</ol>
    </nav>
  `;
}
