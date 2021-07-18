import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import vuePlugin from '@vitejs/plugin-vue';
import { GContext } from './ctx';
import { createJsonApi } from './middlewares/jsonApi';
import serveStatic from 'serve-static';

export interface ICreateServerOptions {
  port?: number;
}

export async function createServer(
  ctx: GContext,
  options: ICreateServerOptions = {},
) {
  const isProd = process.env.NODE_ENV === 'production';

  console.log({
    isProd,
  });

  const app = express();

  options = {
    port: 4000,
    ...options,
  };

  const LOCAL_ADDRESS = `http://localhost:${options.port}`;

  const jsonApi = createJsonApi(ctx);

  app.use('/api', jsonApi);

  if (!isProd) {
    // 以中间件模式创建 vite 应用，这将禁用 Vite 自身的 HTML 服务逻辑
    // 并让上级服务器接管控制
    //
    // 如果你想使用 Vite 自己的 HTML 服务逻辑（将 Vite 作为
    // 一个开发中间件来使用），那么这里请用 'html'
    const vite = await createViteServer({
      root: ctx.dirs.appDir,
      server: { middlewareMode: 'ssr' },
      plugins: [vuePlugin()],
      define: {
        __PROD__: false,
      },
    });

    // 使用 vite 的 Connect 实例作为中间件
    app.use(vite.middlewares);

    app.use('*', async (req, res) => {
      // 服务 index.html - 下面我们来处理这个问题
      const url = req.originalUrl;

      try {
        // 1. 读取 index.html
        let template = fs.readFileSync(
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
        const { render } = await vite.ssrLoadModule('/entry-server.ts');

        // 4. 渲染应用的 HTML。这假设 entry-server.js 导出的 `render`
        //    函数调用了适当的 SSR 框架 API。
        //    例如 ReactDOMServer.renderToString()
        const [appHtml, _preLoad, initialState] = await render(
          url,
          {},
          {
            serverAddress: LOCAL_ADDRESS,
          },
        );

        const headPartial = [
          `<script>window.__INITIAL_STATE__=${JSON.stringify(
            initialState,
          )}</script>`,
          // TODO 普通页面
          // `<script>window.__PLAIN_PAGES__=${JSON.stringify(
          //   ctx.db._.get('pages').map((it) => it.slug),
          // )}</script>`,
        ].join('\n');

        // 5. 注入渲染后的应用程序 HTML 到模板中。
        const html = template
          .replace(`<!--ssr-head-partial-->`, headPartial)
          .replace(`<!--ssr-outlet-->`, appHtml);

        // 6. 返回渲染后的 HTML。
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        // 如果捕获到了一个错误，让 vite 来修复该堆栈，这样它就可以映射回
        // 你的实际源码中。
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    app.use(
      serveStatic(ctx.resolveGuguRoot('dist/client'), {
        index: false,
      }),
    );

    app.use('*', async (req, res) => {
      // 服务 index.html - 下面我们来处理这个问题
      const url = req.originalUrl;

      try {
        const manifest = require(ctx.resolveGuguRoot(
          'dist/client/manifest.json',
        ));

        const template = fs.readFileSync(
          ctx.resolveGuguRoot('dist/client/index.html'),
          'utf-8',
        );

        const { render } = require(ctx.resolveGuguRoot(
          'dist/server/entry-server.js',
        ));

        const [appHtml, _preLoad, initialState] = await render(url, manifest, {
          serverAddress: LOCAL_ADDRESS,
        });

        const headPartial = [
          `<script>window.__INITIAL_STATE__=${JSON.stringify(
            initialState,
          )}</script>`,
          // TODO 普通页面
          // `<script>window.__PLAIN_PAGES__=${JSON.stringify(
          //   ctx.db._.get('pages').map((it) => it.slug),
          // )}</script>`,
        ].join('\n');

        // 5. 注入渲染后的应用程序 HTML 到模板中。
        const html = template
          .replace(`<!--ssr-head-partial-->`, headPartial)
          .replace(`<!--ssr-outlet-->`, appHtml);

        // 6. 返回渲染后的 HTML。
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  }

  const server = app.listen(options.port);

  console.log(`Server at: ${LOCAL_ADDRESS}`);

  return {
    express: app,
    server,
    serverAddress: LOCAL_ADDRESS,
  };
}
