import * as fs from 'fs';
import * as readline from 'readline';
import { Marked, MarkedExtension } from 'marked';
import hljs from 'highlight.js';
import qs from 'query-string';
import * as htmlEntities from 'html-entities';
import * as path from 'path';
import * as shiki from 'shiki';

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

export interface IEnv {
  filepath: string;
  transformImgSrc?: (src: string) => string;
}

const markedHtmlEnhanceExt = (): MarkedExtension => {
  return {
    async: true,
    async walkTokens(token) {
      // @ts-expect-error
      const options = this.options as IEnv;

      if (token.type === 'code') {
        const [lang = 'text', ...props] = token.lang?.split(' ') ?? [];
        if (lang === 'mermaid') return;

        const sourceCode = token.text;

        let codeResult = await shiki.codeToHtml(sourceCode, {
          lang,
          themes: { light: 'min-light', dark: 'night-owl' },
          defaultColor: false,
          transformers: [],
        });

        codeResult = codeResult
          .replaceAll('{', '&lcub;')
          .replaceAll('}', '&rcub;');

        // transforms token to html
        Object.assign(token, {
          type: 'html',
          block: true,
          text: `${codeResult}\n`,
        });
      }
    },
    renderer: {
      code({ text: sourceCode, lang }) {
        const options = this.options as IEnv;
        const language = lang!;
        // 处理 mermaid 图表
        if (/^mermaid$/i.test(language)) {
          return `<pre class="mermaid">${sourceCode}</pre>`;
        }
        return '';
      },
      heading({ tokens, depth: level, ...rest }) {
        const options = this.options as IEnv;
        const text = this.parser.parseInline(tokens).trim();
        // remove html tag
        // input: text text <a href="#text">text2</a>
        // output: text text text2
        const anchorText = text.replace(/<[^>]+>/g, '');
        return `<h${level} id="${anchorText}">${text}<a name="${anchorText}" class="headerlink" href="#${anchorText}"></a></h${level}>`;
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
      image(imgToken) {
        const { href, title: imgAttrsQuery, text: alt } = imgToken;
        const options = this.parser.options as IEnv;
        const attrInput = qs.parse(
          htmlEntities.decode(imgAttrsQuery || ''),
        ) as Record<string, string>;
        const imgBaseName = path.basename(href);

        const attrObj = {
          ...attrInput,
        };

        if (attrObj.width) {
          attrObj.width = Number.isFinite(+attrObj.width)
            ? attrObj.width + 'px'
            : attrObj.width;
        }

        const attrs = Object.entries({
          alt: alt || attrObj.title || imgBaseName,
          loading: 'lazy',
          ...attrObj,
          title: attrObj.title || imgBaseName,
          class: `post-image ${attrObj.class || ''}`,
          src: options.transformImgSrc ? options.transformImgSrc(href) : href,
        }).map(([key, value]) =>
          value ? `${key}=${JSON.stringify(htmlEntities.encode(value))}` : '',
        );
        const attrsStr = attrs.join(' ');

        return `<img ${attrsStr}  onerror="this.onerror=null;this.src='/images/image-error.jpg';">`;
      },
    },
  };
};

export type IGMarkerd = ReturnType<typeof createRenderer>;

export const createRenderer = () => {
  const marked = new Marked(markedHtmlEnhanceExt());

  const gParse = (md: string, env: IEnv) => {
    return marked.parse(md, { async: true, ...env });
  };

  return Object.assign(marked, {
    gParse,
  });
};
