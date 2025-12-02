import * as fs from 'fs';
import * as readline from 'readline';
import { Marked, MarkedExtension, MarkedOptions } from 'marked';
import qs from 'query-string';
import * as htmlEntities from 'html-entities';
import * as path from 'path';
import * as shiki from 'shiki';
import { createLogger } from './logger.mts';
import { type ITocItem } from '../../types/index.mts';

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
  _headings?: ITocItem[];
}

const markedHtmlEnhanceExt = (options: IEnv): MarkedExtension => {
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

        // TODO 识别 v-pre 指令
        codeResult = codeResult
          .replaceAll('{', '&lcub;')
          .replaceAll('}', '&rcub;');

        // transforms token to html
        Object.assign(token, {
          type: 'html',
          block: true,
          text: `${codeResult}\n`,
        });
        return;
      } // end code

      if (token.type === 'link') {
        // @ts-ignore
        if (options.transformLinkHref) {
          token.href = await options.transformLinkHref(token.href);
        }
        return;
      } // end link
    },
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
        if (!options._headings) {
          options._headings = [];
        }

        const text = this.parser.parseInline(tokens).trim();
        if (level === 1) {
          logger.warn(`文章正文不建议使用 1 级标题，${options.filepath}`);
        }
        // remove html tag
        // input: text text <a href="#text">text2</a>
        // output: text text text2
        const plainText = htmlEntities.decode(text.replace(/<[^>]+>/g, ''));
        const id = encodeURIComponent(plainText);

        options._headings.push({
          id,
          text: plainText,
          level,
        });

        return `<h${level} id="${id}">${text}<a name="${id}" class="headerlink" href="#${id}"></a></h${level}>`;
      },
      link({ href, title: aAttrsQuery, text }) {
        const attrs = qs.parse(
          htmlEntities.decode(aAttrsQuery || ''),
        ) as Record<string, string>;

        if (/^\w+:/.test(href)) {
          attrs.target = '_blank';
        }

        const attrStr = Object.entries({ ...attrs, href })
          .map(([key, value]) =>
            value ? `${key}=${JSON.stringify(htmlEntities.encode(value))}` : '',
          )
          .join(' ');

        return `<a-link ${attrStr}>${text}</a-link>`;
      },
      image(imgToken) {
        const { href, title: imgAttrsQuery, text: alt } = imgToken;
        const attrInput: Record<string, string> = imgAttrsQuery?.includes('=')
          ? (qs.parse(htmlEntities.decode(imgAttrsQuery || '')) as any)
          : {
              title: imgAttrsQuery,
            };
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

function formatTocArrayToTree(tocs: ITocItem[]): ITocItem[] {
  if (!tocs.length) return [];

  const root: ITocItem = {
    level: 0,
    text: '',
    id: '',
    children: [],
  };

  // 层级栈：存储当前路径的所有父节点（栈顶为最近的父节点）
  const levelStack: ITocItem[] = [root];

  for (const toc of tocs) {
    toc.children ||= [];

    // 找到当前项的父节点：栈中最后一个层级 < 当前层级的节点
    // 从栈顶往回找，确保层级连续（比如level=3的父节点必须是level=2）
    while (levelStack.length > 0) {
      const lastParent = levelStack.at(-1)!;
      if (lastParent.level < toc.level) {
        toc.parent = lastParent.id;
        // 将当前项添加到父节点的children中
        lastParent.children?.push(toc);
        // 更新栈：当前项成为下一层级的潜在父节点
        levelStack.push(toc);
        break;
      } else {
        // 层级不匹配，弹出栈顶（说明当前父节点层级 >= 当前项，不是正确的父节点）
        levelStack.pop();
      }
    }
  }

  // 根节点的children就是最终的树结构（level=2及以下的层级都已嵌套）
  return root.children || [];
}

export async function renderMarkdown(
  md: string,
  env: IEnv,
): Promise<{
  html: string;
  headings: ITocItem[];
}> {
  const marked = new Marked(markedHtmlEnhanceExt(env));
  return {
    html: await marked.parse(md, {
      async: true,
    }),
    headings: formatTocArrayToTree(env._headings || []),
  };
}
