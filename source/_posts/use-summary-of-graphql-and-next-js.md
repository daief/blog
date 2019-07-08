---
title: GraphQL、Next.js 使用小结
date: 2019-07-03 19:11:51
id: use-summary-of-graphql-and-next-js
categories: ["前端"]
tags:
  - SSR
  - GraphQL
keywords:
  - 'Next.js'
  - SSR
  - GraphQL
description:
---

ssr & nodejs、graphql

static export

开发中使用样式

静态导出时的样式，子进程，antd/style/、动态路由

workspaces 模式下 ts 文件解析

---

这段时间新建了两个后台项目，都是基于 [Next.js](https://github.com/zeit/next.js) 搭建，Next.js 的介绍很简单。

> Next.js 是一个轻量级的 React 服务端渲染应用框架。

第一个项目上了 `SSR`（Server-Side Rendering，不过这里的 SSR 更多表示同构） + [GraphQL](https://graphql.org) 服务；第二个项目用了 `next export`（Next.js 页面预渲染、静态导出） + `GraphQL Client`。两者用词虽然差不多，但实际上并不是一回事，最明显的一个区别在于是否需要 `Nodejs 中间层`。

本文主要内容包括两个项目的介绍，并记录一些在开发过程中遇到的问题和解决，本文对应 next 版本为 ~~v8.0.3~~。写的时候发现升级到 v9.0.0 了，自带 TS 支持了，果断把 demo 的版本也升级了。

上一篇文章（《{% post_link get-a-ssr-demo-step-by-step %}》）介绍了从零搭建 SSR 的过程，并且附带了一些问题的讲解，推荐结合阅读。所以，类似问题该篇将不再赘述。

<!-- TODO demo 地址 -->

<!-- more -->

## 项目一

### 简介

该项目是一个对内的、管理各种应用的后台（简称认证中心），其中的一个功能是实现各个应用间的[单点登录（SSO）](https://en.wikipedia.org/wiki/Single_sign-on)。

Java 端基于 [JWT（Json web token）](https://en.wikipedia.org/wiki/JSON_Web_Token) 实现授权认证，前端应用在请求时要把 token 加到请求头当中，同时也会将 token 缓存于 localStorage。这里的每个应用都有一个不同的二级域名（如 a.example.com、b.example.com），而 localStorage 由于跨域限制，前端应用之间不能共享 token，在这种情况打开新的应用时就会需要重新登录。

因此，新的方案是把 token 存储在 cookie 里，并设置 Domain 为根域名（.example.com）。如此一来各个应用之间直接就共享 token，而且每个应用不再需要维护 token。

因为这是一个对内的应用，同时出于对技术的追求，前端组表示添加 Node.js 中间层来做 cookie 的控制，而 Java 端一切保持不变。加上了 Node 层之后，又顺理成章地加上了 SSR、GraphQL Server。然而，也带来了一系列的坑。

对于认证中心，整体时序图如下。

<!-- TODO 这里放个时序图 -->

### 遇见的一些问题

主要框架：

- TypeScript
- Next.js
- antd
- apollo-\* 系列（fastify、apollo-server-fastify、apollo-client ……）

#### 引用样式文件时报错

这个应该是使用 SSR 时候的经典问题了，不过有关样式文件在 SSR 中的问题在{% post_link get-a-ssr-demo-step-by-step %}有详细解读，这里只说明该问题在 Next.js 中的具体解决以及和 Next.js 有关的注意点。（官方貌似比较推崇 CSS-in-JS）

这个问题主要可概括为两点：一是缺少 webpack 对于 CSS、Less 的配置；二是 SSR 项目运行的特点。

添加相应的 webpack 配置，如使用官方的配置扩展插件：[@zeit/next-css](https://github.com/zeit/next-plugins/tree/master/packages/next-css)、[@zeit/next-less](https://github.com/zeit/next-plugins/tree/master/packages/next-less)，然后在 `next.config.js` 中使用：

```js
// next.config.js
const withCSS = require("@zeit/next-css");
module.exports = withCSS(
  withLess({
    /* config options here */
    cssModules: /* 开启 cssModules */ true,
    lessLoaderOptions: {
      javascriptEnabled: true
    },
    cssLoaderOptions: {
      importLoaders: 1,
      localIdentName: "[local]_[hash:base64:5]"
    }
  })
);
```

如此一来，项目中就能正常引用样式文件了。

> 坑点：引入第三方组件库如 antd 时样式依旧会报错。

最为简单的方式，在 `next.config.js` 顶部添加：

```js
// next.config.js
if (typeof require !== "undefined") {
  require.extensions[".css"] = file => {};
  require.extensions[".less"] = file => {};
}
```

> 坑点：所有的样式文件都开启了 CSS modules；打包时样式依旧报错。

尝试自定义 webpack 的样式配置，简单粗暴之处在于所有（Server & Client）样式都过一遍 loader，不足之处也是如此。在这样的配置下，只要在需要开启 CSS modules 的地方添加 `:local()` 即可。（以下配置基于 css-loader@^3，顺便一提官方插件所用的是 css-loader@1，两者配置之间会有差异）

```js
// withStyle.js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      const { dev, isServer } = options;
      const {
        cssLoaderOptions,
        postcssLoaderOptions,
        lessLoaderOptions = {}
      } = nextConfig;

      options.defaultLoaders.css = [
        {
          loader: MiniCssExtractPlugin.loader
        },
        {
          loader: "css-loader",
          options: {
            sourceMap: dev,
            modules: {
              mode: "global",
              localIdentName: "[local]--[hash:base64:5]"
            },
            ...cssLoaderOptions
          }
        }
      ];

      options.defaultLoaders.less = [
        ...options.defaultLoaders.css,
        {
          loader: "less-loader",
          options: {
            javascriptEnabled: true,
            ...lessLoaderOptions
          }
        }
      ];

      config.module.rules.push(
        {
          test: /\.css$/,
          use: options.defaultLoaders.css
        },
        {
          test: /\.less$/,
          use: options.defaultLoaders.less
        }
      );

      config.plugins.push(
        new MiniCssExtractPlugin({
          filename: dev ? "[name].css" : "[name].[hash].css",
          chunkFilename: dev ? "[id].css" : "[id].[hash].css"
        })
      );

      if (!dev && !isServer) {
        // 构建模式 & Client 才开启压缩
        config.optimization.minimizer = [
          ...config.optimization.minimizer,
          new OptimizeCSSAssetsPlugin({})
        ];
      }

      // ......
    }
  });
};
```

最后再修改 externals 配置，放开 antd 的样式就能支持了。

```js
// next.config.js
// 这种配置下就不需要在顶部添加对 require 的处理了
const withStyle = require("@react-ssr/shared/next-config/withStyle");

module.exports = withStyle({
  webpack(config, options) {
    if (isServer) {
      // https://github.com/zeit/next.js/blob/canary/examples/with-ant-design/next.config.js
      // 如果有其他 UI 库的样式，在此补充
      const antStyles = /antd\/.*?\/style.*?/;
      const origExternals = [...config.externals];
      config.externals = [
        (context, request, callback) => {
          if (request.match(antStyles)) return callback();
          if (typeof origExternals[0] === "function") {
            origExternals[0](context, request, callback);
          } else {
            callback();
          }
        },
        ...(typeof origExternals[0] === "function" ? [] : origExternals)
      ];
    }

    return config;
  }
});
```

#### 引用图片等静态文件

Next.js 对 [`static/` 目录有特殊的支持](https://github.com/zeit/next.js#static-file-serving-eg-images)，推荐将静态资源放在这个目录，通过 `/static/some/target.png` 的形式进行引用。而且在 v9.0.0 版本在打包时还会自动对 `static/` 目录内的文件进行压缩。

但还是存在 `import img from './a.png'` 的需求，这时同样进行 webpack 的配置作为支持即可。注意，如下配置 file-loader 实际上对图片处理了两遍，只是输出路径一致最终只有一份。

```js
// next.config.js

config.module.rules.push({
  test: /\.(jpe?g|png|svg|gif|ico|webp)$/,
  use: [
    {
      loader: "url-loader",
      options: {
        limit: 8192,
        fallback: "file-loader",
        publicPath: `/_next/static/images/`,
        outputPath: `${isServer ? "../" : ""}static/images/`,
        name: "[name]-[hash].[ext]"
      }
    }
  ]
});

```
