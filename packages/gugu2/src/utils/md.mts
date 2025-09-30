import * as fs from 'fs';
import * as readline from 'readline';
import { Marked, MarkedExtension } from 'marked';
import hljs from 'highlight.js';
import qs from 'query-string';
import * as htmlEntities from 'html-entities';

export async function readUntilMore(
  filepath: string,
  splitter = '<!-- more -->',
) {
  const stream = fs.createReadStream(filepath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: stream });

  const lines: string[] = [];

  try {
    for await (const line of rl) {
      if (line.trim() === splitter) {
        break;
      }
      lines.push(line);
    }
  } finally {
    // The for...await...of loop ensures that rl.close() is called.
    // We must manually close the stream, as rl.close() does not do so.
    stream.close();
  }

  return lines.join('\n');
}

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
      code: ({ text: sourceCode, lang }) => {
        const language = lang!;
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
        const escapedText = text.toLowerCase();
        // TODO
        // .replace(/[^\w]+/g, '-');
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
