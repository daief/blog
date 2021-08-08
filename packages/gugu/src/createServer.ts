import express from 'express';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import { GContext } from './ctx';
import { createJsonApi } from './middlewares/jsonApi';
import serveStatic from 'serve-static';
import { getViteConfig } from './utils/viteConfig';

export interface ICreateServerOptions {
  port?: number;
}

export async function createServer(
  ctx: GContext,
  options: ICreateServerOptions = {},
) {
  const isProd =
    process.env.NODE_ENV === 'production' || ctx.command === 'generate';
  const app = express();

  options = {
    port: 4000,
    ...options,
  };

  app.use(
    serveStatic(ctx.resolveGuguRoot('dist/client'), {
      index: false,
    }),
  );

  const LOCAL_ADDRESS = `http://localhost:${options.port}`;

  const jsonApi = createJsonApi(ctx);

  app.use('/blog-api', jsonApi);

  app.get('/sitemap.xml', (req, res) => {
    const links = ctx.dao
      .getRoutes()
      .map((path) => `<url><loc>${ctx.userConfig.url}${path}</loc></url>`)
      .join('');
    const xml = `<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${links}</urlset>`;
    res.setHeader('Content-Type', 'text/xml');
    return res.send(xml);
  });

  let vite: ViteDevServer;
  if (!isProd) {
    // 以中间件模式创建 vite 应用，这将禁用 Vite 自身的 HTML 服务逻辑
    // 并让上级服务器接管控制
    //
    // 如果你想使用 Vite 自己的 HTML 服务逻辑（将 Vite 作为
    // 一个开发中间件来使用），那么这里请用 'html'
    vite = await createViteServer(
      getViteConfig(ctx, false, {
        server: { middlewareMode: 'ssr' },
      }),
    );

    // 使用 vite 的 Connect 实例作为中间件
    app.use(vite.middlewares);
  }

  app.use('*', async (req, res) => {
    const url = req.originalUrl;
    try {
      let template = '';
      let render: any;

      if (!isProd) {
        // 1. 读取 index.html
        template = fs.readFileSync(
          path.resolve(ctx.dirs.appDir, 'index.html'),
          'utf-8',
        );

        // 2. 应用 vite HTML 转换。这将会注入 vite HMR 客户端，
        //    同时也会从 Vite 插件应用 HTML 转换。
        //    例如：@vitejs/plugin-react-refresh 中的 global preambles
        template = await vite.transformIndexHtml(url, template);

        // 3. 加载服务器入口。vite.ssrLoadModule 将自动转换
        //    你的 ESM 源码使之可以在 Node.js 中运行！无需打包
        //    并提供类似 HMR 的根据情况随时失效。
        ({ render } = await vite.ssrLoadModule('/entry-server.ts'));
      } else {
        template = fs.readFileSync(
          ctx.resolveGuguRoot('dist/client/index.html'),
          'utf-8',
        );
        ({ render } = require(ctx.resolveGuguRoot(
          'dist/server/entry-server.js',
        )));
      }

      const serverState = {
        global: {
          site: ctx.dao.getSiteInfo(),
          simplePages: ctx.dao.getSimplePages().map((it) => ({
            id: it.id,
            slug: it.slug,
            path: it.path,
          })),
        },
      };

      // 4. 渲染应用的 HTML。这假设 entry-server.js 导出的 `render`
      //    函数调用了适当的 SSR 框架 API。
      //    例如 ReactDOMServer.renderToString()
      const { appHtml, initialState, headTags, htmlAttrs, bodyAttrs } =
        await render(
          url,
          {},
          {
            serverState,
            serverAddress: LOCAL_ADDRESS,
          },
        );

      const headPartial = [
        headTags,
        `<script>window.__INITIAL_STATE__=${JSON.stringify(
          initialState,
        )}</script>`,
        // `<script>window.__PLAIN_PAGES__=${JSON.stringify(
        //   ctx.dao.getSimplePages().map,
        // )}</script>`,
      ].join('\n');

      // 5. 注入渲染后的应用程序 HTML 到模板中。
      const html = template
        .replace('sstHtmlAttrs', htmlAttrs)
        .replace('ssrBodyAttrs', bodyAttrs)
        .replace(`<!--ssr-head-partial-->`, headPartial)
        .replace(`<!--ssr-outlet-->`, appHtml);

      // 6. 返回渲染后的 HTML。
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      // 如果捕获到了一个错误，让 vite 来修复该堆栈，这样它就可以映射回
      // 你的实际源码中。
      !isProd && vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  const server = app.listen(options.port);

  console.log(`Server at: ${LOCAL_ADDRESS}`);

  return {
    express: app,
    server,
    serverAddress: LOCAL_ADDRESS,
  };
}
