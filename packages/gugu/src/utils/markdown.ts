import { Marked, MarkedExtension } from 'marked';
import hljs from 'highlight.js';
import qs from 'query-string';
import htmlEntities from 'html-entities';

export const escapeHtml = (str: string) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ((
        {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        } as any
      )[tag] || tag),
  );

const markedHtmlEnhanceExt = (): MarkedExtension => {
  return {
    renderer: {
      code: ({ text: sourceCode, lang: language }) => {
        // 处理 mermaid 图表
        if (/^mermaid$/i.test(language)) {
          return `<div class="mermaid">${sourceCode}</div>`;
        }
        const codeResult = !hljs.getLanguage(language)
          ? escapeHtml(sourceCode)
          : hljs.highlight(sourceCode, { language }).value;
        return `<pre class="hljs language-${language}" hljs-language="${language}"><code style="display:block;">${codeResult}</code></pre>`;
      },
      heading({ tokens, depth: level }) {
        const text = this.parser.parseInline(tokens);
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        return `<h${level} id="${escapedText}">${text}<a name="${escapedText}" class="headerlink" href="#${escapedText}"></a></h${level}>`;
      },
      link: ({ href, title: aAttrsQuery, text }) => {
        const imgAttrs = qs.parse(
          htmlEntities.decode(aAttrsQuery || ''),
        ) as Record<string, string>;

        const attrStr = Object.entries({ ...imgAttrs, href })
          .map(([key, value]) =>
            value ? `${key}=${JSON.stringify(htmlEntities.encode(value))}` : '',
          )
          .join(' ');

        return `<a ${attrStr}>${text}</a>`;
      },
      image: ({ href, title: imgAttrsQuery }) => {
        return '';
      },
    },
  };
};

export type IGMarkerd = ReturnType<typeof createRenderer>;

export const createRenderer = () => {
  const marked = new Marked(markedHtmlEnhanceExt());

  const gParse = (md: string, env: {}) => {
    return marked.parse(md, { async: false });
  };

  return Object.assign(marked, {
    gParse,
  });
};
