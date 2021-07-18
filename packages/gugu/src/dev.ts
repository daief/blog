import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import vuePlugin from '@vitejs/plugin-vue';
import { GContext } from './ctx';
import { createJsonApi } from './middlewares/jsonApi';

async function createServer(ctx: GContext) {
  const app = express();

  const PORT = 4000;
  const LOCAL_ADDRESS = `http://localhost:${PORT}`;

  // 以中间件模式创建 vite 应用，这将禁用 Vite 自身的 HTML 服务逻辑
  // 并让上级服务器接管控制
  //
  // 如果你想使用 Vite 自己的 HTML 服务逻辑（将 Vite 作为
  // 一个开发中间件来使用），那么这里请用 'html'
  const vite = await createViteServer({
    root: ctx.dirs.guguRoot,
    server: { middlewareMode: 'ssr' },
    plugins: [vuePlugin()],
    define: {
      __PROD__: false,
    },
  });

  const jsonApi = createJsonApi(ctx);

  // 使用 vite 的 Connect 实例作为中间件
  app.use(vite.middlewares);

  app.use('/api', jsonApi);

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
      const { render } = await vite.ssrLoadModule('/app/entry-server.ts');

      // 4. 渲染应用的 HTML。这假设 entry-server.js 导出的 `render`
      //    函数调用了适当的 SSR 框架 API。
      //    例如 ReactDOMServer.renderToString()
      const [appHtml, _preLoad, initialState] = await render(url, void 0, {
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
      // 如果捕获到了一个错误，让 vite 来修复该堆栈，这样它就可以映射回
      // 你的实际源码中。
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(PORT);

  console.log(`Server at: ${LOCAL_ADDRESS}`);

  return app;
}

export function dev(ctx: GContext) {
  createServer(ctx);
}
