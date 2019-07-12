---
title: 从零搭建 SRR
date: 2019-07-02 17:10:37
id: get-a-ssr-demo-step-by-step
categories: ["前端"]
tags:
  - SSR
keywords:
  - SSR
  - SPA
  - React
description:
---

在上一季度中接触并使用了 Next.js，实践了一把 SSR。期间遇见了不少问题，详情可见：{% post_link use-summary-of-next-js-and-graphql %}。

实际上是打算先写那篇文章，但这里还是来写这个了，这样能先从零开始认识 SSR。

先放上 demo 地址：<https://github.com/daief/react-ssr/tree/master/packages/express-ssr-demo>。

<!-- more -->

## 简介

简单列一下三种渲染方式：

- 客户端渲染（CSR - Client-side Rendering）：常见的 SPA 应用，浏览器加载 HTML、JS 文件，接着执行脚本，构建虚拟 DOM（如 Vue、React），最后再将应用挂载到真实节点上。
- 后端渲染：服务器收到请求时，预先进行处理，最后生成一份 HTML 返回给浏览器。
- 同构（SSR - Server-Side Rendering）：这里将 SSR 认为是同构。同构这个概念存在于 Vue，React 这些新型的前端框架中，同构实际上是客户端渲染和服务器端渲染的一个整合。

在同构应用中，写一份代码，在服务端和浏览器都会执行。我们知道（以 React 为例），React 应用中会构建出虚拟 DOM 再挂载到页面上；虚拟 DOM 是内存中的 JS 对象，得益于虚拟 DOM，Node 层也能运行 React。SSR 中 Node 层的一大作用：页面请求来临时，现在 Node 层运行 React 生成虚拟 DOM，再导出成字符串，而后注入到 HTML 返回给浏览器，这一步的同时还能够预先请求数据；浏览器接收 HTML、JS 后运行 React 应用，并能够根据服务端返回的 HTML 快速生成一颗浏览器端的树，同时进行相应的事件绑定。下面借用一张图来展现这整个流程：

[![](https://ae01.alicdn.com/kf/HTB1X2wve.uF3KVjSZK9762VtXXaQ.png)](http://blog.poetries.top/2018/11/18/react-ssr/?utm_source=tuicool&utm_medium=referral)

而下文将要实现的就是这样一个使用了 React 的同构应用 demo。

## 实现

在真正开始之前需要牢记，Node.js 和浏览器虽然都能运行 JS，但其实是要差异的。Node 层没有 DOM，没有 window，不能处理样式，一旦使用都会报错。

框架选择：

- express@^4.17.1
- react@^16.8.0
- webpack@^4.35.0
- typescript@^3.5.0

表面上说是一份代码会在双端执行，但实际上是有两份代码的，不过绝大部分相同。所以，从两份代码的 webpack 配置开始。

### webpack 配置

简单抽离了两者的共同配置，做到项目的基本支持，能够处理 less、images、ts。

```js
const merge = require("webpack-merge");
const nodeExternals = require("webpack-node-externals");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");

const commonCfg = {
  mode: process.env.NODE_ENV,
  context: process.cwd(),
  output: {
    filename: "[name].js"
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"],
    alias: {
      "@": path.resolve(__dirname, "./src/")
    }
  },
  module: {
    rules: [
      // 处理 less 文件
      {
        test: /\.less$/i,
        use: [
          // 本意不想在服务端配置进行拆离的，但不加的时候，服务端 CSS modules 会有问题
          // 所以干脆都加上 MiniCssExtractPlugin 了
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                mode: "global",
                localIdentName: "[local]--[hash:base64:5]"
              }
            }
          },
          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      // 处理图片静态资源，这里其实可以做个优化，让 Server 只需要解析得到路径即可
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        loader: "url-loader/",
        options: {
          limit: 4096,
          fallback: {
            loader: "file-loader",
            options: {
              name: "static/[name].[hash:8].[ext]"
            }
          }
        }
      },
      // 解析 ts
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          happyPackMode: true
        }
      }
    ]
  },
  plugins: [new MiniCssExtractPlugin()]
};
```

然后来看 Server 和 Client 的配置，您会发现也十分简单，主要区分了 entry 和 output。

注意 Server 端的 target 配置以及 externals。**Server 代码运行于服务器，相应的依赖也都在 node_modules 当中，所以服务端部分只把自己写的部分代码打包在一起。** `target` 设置为 `node` 告诉 webpack 这份代码运行于 Node.js，自动排除一些 Node 依赖；`externals: [nodeExternals()]` 的配置会排除掉所有 node_modules 的依赖。

> 注意，如果您使用了类似 yarn workspaces 的功能，那么您需要像我这样配置 webpack-node-externals，因为该插件默认只会在同级寻找 node_modules 的目录，而在 workspaces 的情况下，node_modules 往往在根目录级别。题外话：webpack-node-externals 寻找 node_modules 的原因是预先读取第三方依赖列表，从而作为判断模块引用是否属于依赖，[详情参照源码](https://github.com/liady/webpack-node-externals/blob/cfa1c5b33752fb8cb72360167ae89b23816cdefe/index.js#L36)。

`output.libraryTarget` 设置为 `commonjs` 是因为服务端的结果是要被调用的，接下来会看到。

Client 端需要添加一个 ManifestPlugin，来获取 Client 打包的结果，会在下文中使用到。

```js
const serverCfg = {
  target: "node",
  entry: {
    index: "./src/server"
  },
  output: {
    libraryTarget: "commonjs",
    path: path.resolve(__dirname, "./distServer")
  },
  externals: [
    // 同级寻找
    nodeExternals(),
    // 指定到根目录寻找
    nodeExternals({
      modulesDir: path.resolve(__dirname, "../../node_modules")
    })
  ]
};

const clientCfg = {
  entry: {
    index: "./src/client"
  },
  output: {
    path: path.resolve(__dirname, "./distClient")
  },
  plugins: [new ManifestPlugin()]
};

module.exports = [merge(commonCfg, serverCfg), merge(commonCfg, clientCfg)];
```

一些其他的类似文章，会把服务端对样式的配置作为内联，这里的内联指 `CSS in JS`。因为这样一来服务端就不会出现引用样式文件的情况了，不过这不是一直有用的，有一章会专门说明。

### 添加页面路由和组件

创建 `src` 目录及各自的入口文件 `src/server.tsx` 和 `src/client.tsx`，目录结构大概是这样的。比较简单，相信每个目录、文件的作用可以轻易猜到，不过还是附上注释。

```bash
.
├── src
│   ├── assets          # 存放静态资源
│   │   └── gift.png
│   ├── client.tsx      # Client 入口文件
│   ├── global.less     # 全局的样式
│   ├── pages           # 存放页面组件
│   │   ├── About.tsx
│   │   ├── Home.tsx
│   │   └── home.less
│   ├── routes.tsx      # 路由配置
│   ├── server.tsx      # Server 入口文件
│   └── store           # 简单的 store
│       └── index.ts
├── tsconfig.json       # TS 配置文件
└── webpack.config.js   # webpack 配置文件
```

在这里告诉需要告知您 Server 端和 Client 端的一大不同。两端的路由是截然不同的，在 Server 端，通过请求的路由找到对应的组件；在浏览器，通过地址栏中的 URL 渲染对应组件。而且，当浏览器请求到页面后，此时的路由会转交给浏览器。另外，两端最大的不同就在这里了，下面来看具体的实现。

来看 `routes.tsx`，该文件配置了路由信息，这是相同的，可一笔带过。

```tsx
// routes.tsx
import "@/global.less";
import About from "@/pages/About";
import Home from "@/pages/Home";
import * as React from "react";
import { Route, Switch } from "react-router-dom";

export const Routes: React.SFC = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
    </Switch>
  );
};
```

先来看熟悉的 Client 入口。使用 BrowserRouter 将路由包裹，并将 React 应用挂载到 div。这里使用了 `hydrate`，因为在服务端渲染的情况下能提前得到初次渲染的 HTML，而**hydrate 描述的是 ReactDOM 复用 ReactDOMServer 服务端渲染的内容时尽可能保留结构，并补充事件绑定等 Client 特有内容的过程**（参考 [[1]](https://zh-hans.reactjs.org/docs/react-dom.html#hydrate) [[2]](https://www.zhihu.com/question/66068748)）。

```tsx
// client.tsx
import { Routes } from "@/routes";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

function ClientRender() {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
}

ReactDOM.hydrate(<ClientRender />, document.querySelector("#root"));
```

Server 端入口，整个文件导出了一个工厂函数，返回的是一个组件。注意这里没有浏览器 API，[使用了 StaticRouter](https://reacttraining.com/react-router/web/guides/server-rendering)，通过传入的 URL 来选择对应的组件。

```tsx
// server.tsx
import { Routes } from "@/routes";
import * as React from "react";
import { StaticRouter } from "react-router";

function ServerRender(req, context) {
  return props => {
    return (
      <StaticRouter location={req.url} context={context}>
        <Routes />
      </StaticRouter>
    );
  };
}

export default ServerRender;
```

页面组件就很常规，这里不再叙述。

### 添加 express

目前为止，项目还不能完整运行。在这一步之后，添加 express 的使用后，就能查看效果了。添加新的目录 `server` 以及脚本，目录结构会是这样。

> 这里添加 tsconfig.json 的原因：上一级的配置用于编译整个 src/，而在 src/ 您可能用到 import() 语法，此时需要在 tsconfig.json 中配置 `module: exnext` 来支持；而 server/ 这里只使用原始 tsc 来编译，内层配置 `module: commonjs` 使 server/ 的运行免去一些麻烦。

```bash
.
...
├── server
│   ├── index.ts        # 只要一个脚本
│   └── tsconfig.json   # 专门用于编译 server 代码的配置
├── src
...

```

进入 Server 端脚本正题，详情见注释。

```ts
import express from "express";
import { resolve } from "path";
import * as React from "react";
import ReactDOMServer from "react-dom/server";
// 引用 Server 端打包结果
const serverBuild = require("../distServer").default;
// 引用 Client manifest
const manifest = require("../distClient/manifest.json");

const app = express();

// 将 Client 输出目录作为静态资源目录
app.use(express.static(resolve(__dirname, "../distClient")));

// `/` `/about` 是支持 SSR 的路由
app.get(["/", "/about"], async (req, res) => {
  const context: any = {};

  // 已经渲染过的页面，这里不再渲染
  if (context.url) {
    res.writeHead(302, {
      Location: context.url
    });
    res.end();
  } else {
    // 这里模拟在 Server 端请求数据的延迟
    await new Promise(_ => {
      setTimeout(_, 500);
    });
    // 这里把数据先传进去了，现在没用，稍后说明
    render(req, res, context, { count: 10 });
  }
});

function render(req, res, ctx, data) {
  // 通过 renderToString 将组件转换成 HTML 字符串
  const contentHtml = ReactDOMServer.renderToString(
    // 在服务端运行 React
    React.createElement(serverBuild(req, ctx, data))
  );

  // 下面的是拼接出一个完整的 HTML 并发送给浏览器
  const renderLink = (): string => {
    return Object.keys(manifest)
      .filter(key => /\.css$/.test(key))
      .map(key => `<link rel="stylesheet" href="${manifest[key]}">`)
      .join("\n");
  };

  const renderScripts = (): string => {
    return Object.keys(manifest)
      .filter(key => /\.js$/.test(key))
      .map(key => `<script src="${manifest[key]}"></script>`)
      .join("\n");
  };

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
      ${renderLink()}
    </head>
    <body>
      <div id="root">${contentHtml}</div>
      <script>
        window.__INIT_STORE__ = ${JSON.stringify(data)}
      </script>
      ${renderScripts()}
    </body>
    </html>
  `);
}

const PORT = 5000;
app.listen(PORT, () => {
  // tslint:disable-next-line: no-console
  console.log(`http://localhost:${PORT}`);
});
```

到这里基本差不多了，打开两个终端，切到 express-ssr-demo 的路径，分别执行 `yarn watch:web` & `yarn dev:s`，顺利的话，在 <http://localhost:5000> 就能看到效果，修改页面需要手动刷新一下浏览器。

细心的同学在 Server 端脚本已经看到了模拟请求延迟、数据获取的部分，如果运行了 demo 也能直接看到效果了。接下来就进行这一部分的补充。

### 数据渲染

Server 端脚本如上述即可，接下来只需添加状态管理、修改入口部分即可。

添加状态管理，遵循简单的原则，这里直接在 hooks 的基础上模拟了一个状态管理，若使用 redux 等可自行扩展。

`createStore`，其实这是个 hook，使用时还请注意。

```ts
// src/store/index.ts
import * as React from "react";

export const StoreCtx = React.createContext<{ store: any; dispatch: any }>(
  null
);

export const useStore = () => {
  const result = React.useContext(StoreCtx);
  if (!result) {
    throw new Error("Cannot get a store context");
  }
  return result;
};

export function createStore(initStore) {
  const [store, setStore] = React.useState<any>(initStore);
  return {
    store,
    dispatch: payload => setStore(pre => ({ ...pre, ...payload }))
  };
}
```

分别修改入口。

```tsx
// src/server.tsx
import { Routes } from "@/routes";
import { createStore, StoreCtx } from "@/store";
import * as React from "react";
import { StaticRouter } from "react-router";

function ServerRender(req, context, initStore) {
  return props => {
    // hook 要在这、函数组件内部调用
    const value = createStore(initStore);
    return (
      <StoreCtx.Provider value={value}>
        <StaticRouter location={req.url} context={context}>
          <Routes />
        </StaticRouter>
      </StoreCtx.Provider>
    );
  };
}

export default ServerRender;
```

```tsx
// src/client.tsx
import { Routes } from "@/routes";
import { createStore, StoreCtx } from "@/store";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

// @ts-ignore 这里是浏览器获取初始数据的地方
const initStore = window.__INIT_STORE__;

function ClientRender() {
  const value = createStore(initStore);
  return (
    <StoreCtx.Provider value={value}>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </StoreCtx.Provider>
  );
}

ReactDOM.hydrate(<ClientRender />, document.querySelector("#root"));
```

组件内的使用，也十分简单，比如。

```tsx
// src/pages/Home.tsx
import { useStore } from "@/store";
import * as React from "react";
import * as styles from "./home.less";

export const Home: React.SFC<{}> = props => {
  const { store, dispatch } = useStore();
  return (
    <div className={styles.home}>
      <Button onClick={() => dispatch({ count: store.count + 1 })}>
        click to add:
      </Button>
      {store.count}
    </div>
  );
};

export default Home;
```

## 样式问题

Client 端没问题，这里只针对 Server 端。

上文有提到会把样式文件内联的处理，因为如此一来 Server 端就不会出现引用样式的情况。但是这只对自己项目下的那部分样式。来仔细分析一下 Server 端的打包结果（distServer 是 Server 端打包的输出目录）。

- distServer/
  - pages/home
  - pages/about
  - global.less
  - store
  - ...
- 依赖部分（node_modules）
  - react
  - react-dom
  - ...

在 distServer 只会包含 src/ 的部分，因为在 webpack 明确排除了所有依赖。这一部分中的样式无论是内联还是如上文所述的拆离，都能正常使用。

- 样式内联的情况，没有 `require less` 的情况
- 样式拆离后，代码中也没有引用样式（因为这种情况往往在 Client，是需要在 HTML 额外使用 link 引入的）

这时候添加一些组件库，比如 antd，引入组件和样式。

```ts
import { Button } from "antd";
import "antd/dist/antd.less";

// 或

import Button from "antd/lib/button";
import "antd/lib/button/style";
```

一跑就报错了，无论内联还是拆离，都出现了 `require less` 的情况。打包结果会是这样的。当 Server 端脚本运行、执行 `require('../distServer')` 时，就发生了在 Node 层直接引用 less 的情况，接着就直接报错了。

- distServer/
  - ...
- 依赖部分（node_modules）
  - antd/dist/antd.less
  - antd/lib/button/style
    - index.less
    - ...
  - ...

这时候去搜索解决方案时，会看到有这样的措施。这样的方案很简单，也很有效，这告诉 require 如何去处理样式文件，这里直接返回一个空的对象。这么一来 Node.js 直接引用样式文件也是 OK 的，因为对于 Node 层来讲样式文件的内容并不重要，只是因为 Client 引用了、因为我们运行同一份代码才导致我也引用了，只有不破坏依赖关系即可。

```js
// 只需将如下代码添加到 Node.js 脚本执行的前面
if (typeof require !== "undefined") {
  require.extensions[".css"] = file => {};
  require.extensions[".less"] = file => {};
}
```

细心的同学可能发现了，上面指的样式文件内容不重要，那是因为这样使用的，如果是 `CSS modules` 会怎么样呢。

```js
// 不关心样式内容的引用
import "antd/dist/antd.less";
import "antd/lib/button/style";

// CSS modules 开启
import styles from "./module.less";

console.log(styles.classNameA);
```

这一点倒是不用担心，观察 `distServer/index.js` 可以发现，模块已经被替换成了对象（{"home":"home--1AXZn"}）。

```js
/***/ "./src/pages/home.less":
/*!*****************************!*\
  !*** ./src/pages/home.less ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\nmodule.exports = {\"home\":\"home--1AXZn\"};\n\n//# sourceURL=webpack:///./src/pages/home.less?");

/***/ }),
```

`require.extensions` 虽然好用，但我还是遇见了为难的地方，在使用 `next export`（Next.js 框架的一个命令） 的时候。所幸，这时候遇见了[新的方案](https://github.com/zeit/next.js/blob/e00a2c5d64def08fc5c18c5262bfb52da7c87093/examples/with-ant-design/next.config.js#L11)，再加上 `require.extensions` 已经不再推荐使用，所以 demo 里也替换成了最终方案。

```js
// 修改 Server 的 webpack 配置，如下
const antStyles = /antd\/.*?\/style.*?/;

const serverCfg = {
  target: 'node',
  entry: {
    index: './src/server',
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, './distServer'),
  },
  externals: [
    // 关键是这里，对应的样式不要排除，要交给后续的 loader 处理
    // 因为一旦排除就被放到 node_modules 里去了
    nodeExternals({
      whitelist: [antStyles],
    }),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules'),
      whitelist: [antStyles],
    }),
  ],
  module: {
    rules: [
      {
        // null-loader 的作用是将一个模块静默化，可以看作会把每个作用的模块变成一个空文件再给其他文件去引用
        // 这里的 null-loader 其实不必要
        // 如果加了，需要注意匹配的范围
        // 如果不加只是样式文件会被后面的 loader 处理而已
        test: antStyles,
        use: 'null-loader',
        enforce: 'pre',
      },
    ],
  },
};

```

以上，就是我使用以来对样式文件的纠结。

## 结语

终于到了结束的时候，好久没扯这么长的皮了（字数不够、代码来凑），文中好多“后续、后文再讲”，不知道对读者来说是什么感受，还请见谅。

现在看来 Server 端的依赖不打包，才扯出来这一套套的（指样式文件）；因为是 Server 端，不打包有它的道理，但如果 Server 端直接打包又如何呢？

别当真，如果真尝试了请记得把 React 设置为 external。

在这里十分感谢杰哥给我的耐心讲解，十分感谢点进此文的你！

谨以此文帮助我们对 SSR 能有更好的理解。

最后再放一遍 demo 地址：<https://github.com/daief/react-ssr/tree/master/packages/express-ssr-demo>。

完。

---

参考链接：

- [React 中同构（SSR）原理脉络梳理](https://juejin.im/post/5bc7ea48e51d450e46289eab)
- [从零到一搭建 React SSR 工程架构(一)](http://blog.poetries.top/2018/11/18/react-ssr/?utm_source=tuicool&utm_medium=referral)
