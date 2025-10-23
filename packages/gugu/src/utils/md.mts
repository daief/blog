import * as fs from 'fs';
import * as readline from 'readline';
import { Marked, MarkedExtension, MarkedOptions } from 'marked';
import hljs from 'highlight.js';
import qs from 'query-string';
import * as htmlEntities from 'html-entities';
import * as path from 'path';
import * as shiki from 'shiki';
import { createLogger } from './logger.mts';

const logger = createLogger('[utils:md]');

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
  transformLinkHref?: (href: string) => string | Promise<string>;
}

const createWalkTokens = (
  options: IEnv,
): MarkedOptions<string, string> & {
  async: true;
} => {
  return {
    async: true,
    async walkTokens(token) {
      if (token.type === 'code') {
        if (token.type === 'code') {
          token;
        }
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
      } else if (token.type === 'link') {
        // @ts-ignore
        if (options.transformLinkHref) {
          token.href = await options.transformLinkHref(token.href);
        }
      }
    },
  };
};

const markedHtmlEnhanceExt = (): MarkedExtension => {
  return {
    renderer: {
      code({ text: sourceCode, lang }) {
        const language = lang!;
        // 处理 mermaid 图表
        if (/^mermaid$/i.test(language)) {
          return `<pre class="mermaid">${sourceCode}</pre>`;
        }
        return '';
      },
      heading({ tokens, depth: level }) {
        const text = this.parser.parseInline(tokens).trim();
        if (level === 1) {
          logger.warn(
            `文章正文不建议使用 1 级标题，${(this.options as IEnv).filepath}`,
          );
        }
        // remove html tag
        // input: text text <a href="#text">text2</a>
        // output: text text text2
        const anchorText = text.replace(/<[^>]+>/g, '');
        return `<h${level} id="${anchorText}">${text}<a name="${anchorText}" class="headerlink" href="#${anchorText}"></a></h${level}>`;
      },
      link({ href, title: aAttrsQuery, text }) {
        const imgAttrs = qs.parse(
          htmlEntities.decode(aAttrsQuery || ''),
        ) as Record<string, string>;

        const attrStr = Object.entries({ ...imgAttrs, href })
          .map(([key, value]) =>
            value ? `${key}=${JSON.stringify(htmlEntities.encode(value))}` : '',
          )
          .join(' ');

        return `<a-link ${attrStr}>${text}</a-link>`;
      },
      image(imgToken) {
        const options = this.options as IEnv;
        const { href, title: imgAttrsQuery, text: alt } = imgToken;
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
    return marked.parse(md, {
      ...env,
      ...createWalkTokens(env),
    });
  };

  return Object.assign(marked, {
    gParse,
  });
};
