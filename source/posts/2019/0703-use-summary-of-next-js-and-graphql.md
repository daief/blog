---
title: Next.js、GraphQL 使用小结
date: 2019-07-03 19:11:51
id: use-summary-of-next-js-and-graphql
categories: ['前端']
tags:
  - SSR
  - GraphQL
keywords:
  - 'Next.js'
  - SSR
  - GraphQL
description:
---

近段时间里使用 [Next.js](https://github.com/zeit/next.js) 搭建了两个后台，同时还使用了 GraphQL。期间匆匆忙忙，而且项目都是另一个前端老哥搭建的。所以，自己又抽空从头开始搭建了几个 demo，回顾一下知识，同时整理了一下当时遇见的问题、梳理下其中缘由。

本文主要内容包括三个 demo 的介绍，并记录一些在开发过程中遇到的问题和解决，本文对应 Next.js 版本为 ~~v8.0.3~~。写的时候发现 Next.js 升级到 v9.0.0 了，自带 TypeScript 支持了，果断把 demo 的版本也升级了。

上一篇文章（《{% post_link get-a-ssr-demo-step-by-step %}》）介绍了从零搭建 SSR 的过程，并且附带了一些问题的讲解，推荐结合阅读。

那么，按照惯例就先呈上 demo 地址：[react-ssr](https://github.com/daief/react-ssr)。

<!-- more -->

# 简介

本节对三个 demo 作个简单介绍。

正常运行该项目需要配置本地 hosts。

```bash
# hosts
# 模拟 gql-server 的域名
127.0.0.1			gql-server.example.com
# 模拟应用 account 的域名（nextjs-ssr 或 nextjs-static）
127.0.0.1			account.example.com
# 模拟应用 customer 的域名（nextjs-ssr 或 nextjs-static）
127.0.0.1			customer.example.com
```

或者在 `packages/shared/CONFIG.ts` 文件中修改成其他域名配置，然后通过域名 + 端口的形式访问本地开发环境。

## nextjs-ssr

> 地址：<https://github.com/daief/react-ssr/tree/master/packages/nextjs-ssr>

这第一个 demo 对应业务开发中的第一个后台，该后台是一个对内的、管理各种应用的后台，其中一个功能需要实现各个应用间的[单点登录（SSO）](https://en.wikipedia.org/wiki/Single_sign-on)。

Java 端基于 [JWT（Json web token）](https://en.wikipedia.org/wiki/JSON_Web_Token) 实现授权认证，前端应用在请求时需要把 token 加到请求头当中，同时也会将 token 缓存于 localStorage。

这里的每个应用都有一个不同的二级域名（如 a.example.com、b.example.com），而 localStorage 由于跨域限制，前端应用之间不能共享 token，在这种情况打开新的应用时就会需要重新登录。

因此，新的方案是把 token 存储在 cookie 里，并设置 Domain 为根域名（.example.com）。如此一来各个应用之间直接就共享 token，而且每个应用不再需要维护 token。

因为这是一个对内的应用，同时出于对技术的追求，该项目决定试用 SSR，选型 Next.js。同时前端组表示可以用中间层来做 cookie 的维护，而 Java 端一切保持不变。加上了 Node 层之后，又顺理成章地加上了 GraphQL Server。

## gql-server

> 地址：<https://github.com/daief/react-ssr/tree/master/packages/gql-server>

这是一个独立的中间层，主要作用是提供 GraphQL 服务、cookie 管理。

其实上面选择用 Next.js 做 SSR 的时候就已经添加了一个 Node 服务，但这里还是另外再起了一个服务，依我的想法出于两个原因：Next.js 服务专门负责 SSR，这边专门提供 GraphQL 服务，职责会比较清晰；两者同一个服务时，Next.js 会作为一个中间来件运作，开发调试时若修改服务端部分代码调试工具会自动重启服务，这就会导致 next 部分也重启了、而且得重新编译，很费时间。

该项目基于 [Apollo GraphQL](https://www.apollographql.com/docs/) 系列搭建。

nextjs-ssr + gql-server + Java 的整体运作情况如下。

![](use-summary-of-next-js-and-graphql/sequence-chart.jpg)

## nextjs-static

> 地址：<https://github.com/daief/react-ssr/tree/master/packages/nextjs-static>

该 demo 也使用 Next.js 框架，但依赖的是 Prerender 的功能，最终是静态部署，所以项目中踢除、避免 Server 端的代码。（该 demo 对应第二个后台，只是个常规的管理后台）

请求部分依旧使用了 GraphQL，不过该项目没有对应的 GraphQL 服务，API 是 REST 形式的。

通过 [apollo-link](https://www.apollographql.com/docs/link/)（可看作是 apollo-client 的中间件）使得 GraphQL 变得十分灵活、不仅仅是依赖于 GraphQL 服务而使用。

> apollo-client 是用于发起 GraphQL 请求的一种客户端框架。

这里的主角是 [apollo-link-rest](https://www.apollographql.com/docs/link/links/rest/)，让我们很轻易地通过 GraphQL 调用 REST API。

这样可以在前端实现接口聚合、字段查询（基于真实接口的返回）等 GraphQL 的特色功能。

# Next.js 使用问题

下面把和 Next.js 有关的问题聚合在这一节。

## 样式文件的处理

这个应该是使用 SSR 时候的经典问题了，不过有关样式文件在 SSR 中的问题在{% post_link get-a-ssr-demo-step-by-step %}有详细解读，这里只说明该问题在 Next.js 中的具体解决以及和 Next.js 有关的注意点。

这个问题主要可概括为两点：一是缺少 webpack 对于 CSS、Less 的配置；二是 SSR 项目运行的特点。

添加相应的 webpack 配置，可使用官方的配置扩展插件：[@zeit/next-css](https://github.com/zeit/next-plugins/tree/master/packages/next-css)、[@zeit/next-less](https://github.com/zeit/next-plugins/tree/master/packages/next-less)，然后在 `next.config.js` 中使用：

```js
// next.config.js
const withCSS = require('@zeit/next-css');
module.exports = withCSS(
  withLess({
    /* config options here */
    cssModules: /* 开启 cssModules */ true,
    lessLoaderOptions: {
      javascriptEnabled: true,
    },
    cssLoaderOptions: {
      importLoaders: 1,
      localIdentName: '[local]_[hash:base64:5]',
    },
  }),
);
```

如此一来，项目中就能正常引用样式文件了。

> 坑点：引入第三方组件库如 antd 时样式依旧会报错。

最为简单的方式，在 `next.config.js` 顶部添加：

```js
// next.config.js
if (typeof require !== 'undefined') {
  require.extensions['.css'] = file => {};
  require.extensions['.less'] = file => {};
}
```

> 坑点：所有的样式文件都开启了 CSS modules；打包时样式依旧报错。

尝试自定义 webpack 的样式配置，简单粗暴之处在于所有（Server & Client）样式都过一遍 loader。在这样的配置下，只要在需要开启 CSS modules 的地方添加 `:local()` 即可。（以下配置基于 css-loader@^3，顺便一提官方插件所用的是 css-loader@1，两者配置之间会有差异）

```js
// withStyle.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      const { dev, isServer } = options;
      const {
        cssLoaderOptions,
        postcssLoaderOptions,
        lessLoaderOptions = {},
      } = nextConfig;

      options.defaultLoaders.css = [
        {
          loader: MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
          options: {
            sourceMap: dev,
            modules: {
              mode: 'global',
              localIdentName: '[local]--[hash:base64:5]',
            },
            ...cssLoaderOptions,
          },
        },
      ];

      options.defaultLoaders.less = [
        ...options.defaultLoaders.css,
        {
          loader: 'less-loader',
          options: {
            javascriptEnabled: true,
            ...lessLoaderOptions,
          },
        },
      ];

      config.module.rules.push(
        {
          test: /\.css$/,
          use: options.defaultLoaders.css,
        },
        {
          test: /\.less$/,
          use: options.defaultLoaders.less,
        },
      );

      config.plugins.push(
        new MiniCssExtractPlugin({
          // 要加上 static，否则打包后 404
          filename: dev
            ? 'static/css/[name].css'
            : 'static/css/[name].[contenthash:8].css',
          chunkFilename: dev
            ? 'static/css/[name].chunk.css'
            : 'static/css/[name].[contenthash:8].chunk.css',
        }),
        new (require('webpack-filter-warnings-plugin'))({
          exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
        }),
      );

      if (!dev && !isServer) {
        // 构建模式 & Client 才开启压缩
        config.optimization.minimizer = [
          ...config.optimization.minimizer,
          new OptimizeCSSAssetsPlugin({}),
        ];
      }

      // ......
    },
  });
};
```

最后再修改 externals 配置，放开 antd 的样式就能支持了。

```js
// next.config.js
// 这种配置下就不需要在顶部添加对 require 的处理了
const withStyle = require('@react-ssr/shared/next-config/withStyle');

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
          if (typeof origExternals[0] === 'function') {
            origExternals[0](context, request, callback);
          } else {
            callback();
          }
        },
        ...(typeof origExternals[0] === 'function' ? [] : origExternals),
      ];
    }

    return config;
  },
});
```

> 坑点：打包后，前端路由切换页面时样式丢失。

这是因为样式在打包后，根据页面被拆分开来。而当第一打开页面时，SSR 渲染的 HTML 文档中只包含当前页面的 CSS 链接，此时在前端切换页面时也不会去加载缺失的样式文件。目前为止的解决方式是将所有的样式打包在一起，添加对应的如下配置。

```js
// withStyle.js

// ...
module.exports = () => ({
  webpack() {
    // 把所有 css 合并，因为前端路由切换页面的时候不会拉取对应的 css 文件
    // 服务端配置走不走不影响
    config.optimization.splitChunks.cacheGroups.styles = {
      name: 'styles',
      test: /\.(css|less)$/,
      chunks: 'all',
      enforce: true,
    };
    // ...
  },
});
```

## 图片等静态文件处理

Next.js 对 [`static/` 目录有特殊的支持](https://github.com/zeit/next.js#static-file-serving-eg-images)，推荐将静态资源放在这个目录，通过 `/static/some/target.png` 的形式进行引用。而且在 v9.0.0 版本在打包时还会自动对 `static/` 目录内的文件进行压缩。

但还是存在 `import img from './a.png'` 的需求，这时同样进行 webpack 的配置作为支持即可。注意，如下配置 file-loader 实际上对图片处理了两遍，只是输出路径一致最终只有一份。

```js
// next.config.js

config.module.rules.push({
  test: /\.(jpe?g|png|svg|gif|ico|webp)$/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 8192,
        fallback: 'file-loader',
        publicPath: `/_next/static/images/`,
        outputPath: `${isServer ? '../' : ''}static/images/`,
        name: '[name]-[hash].[ext]',
      },
    },
  ],
});
```

## Monorepo 中的 Babel 配置

当项目以 [Monorepo](https://en.wikipedia.org/wiki/Monorepo) 方式组织，同时引用其他子包内容时，引用的部分是不会经过 Babel 处理的。

```js
// Next.js 中 webpack 的 Babel 配置
// https://github.com/zeit/next.js/blob/aac4e21d46f300d8433b0bd94a7a0f51e443b7d4/packages/next/build/webpack-config.ts#L394
[
  // ...
  {
    test: /\.(tsx|ts|js|mjs|jsx)$/,
    include: [
      dir,
      /next-server[\\/]dist[\\/]lib/,
      /next[\\/]dist[\\/]client/,
      /next[\\/]dist[\\/]pages/,
      /[\\/](strip-ansi|ansi-regex)[\\/]/,
    ],
    exclude: (path: string) => {
      if (
        /next-server[\\/]dist[\\/]lib/.test(path) ||
        /next[\\/]dist[\\/]client/.test(path) ||
        /next[\\/]dist[\\/]pages/.test(path) ||
        /[\\/](strip-ansi|ansi-regex)[\\/]/.test(path)
      ) {
        return false;
      }

      return /node_modules/.test(path);
    },
    use: defaultLoaders.babel,
  },
  // ...
];
```

插件 [next-transpile-modules](https://www.npmjs.com/package/next-transpile-modules) 可以很方便地解决这个问题。

```js
// next.config.js
// https://github.com/zeit/next.js/blob/aac4e21d46f300d8433b0bd94a7a0f51e443b7d4/examples/with-yarn-workspaces/packages/web-app/next.config.js#L1

const withTM = require('next-transpile-modules');

module.exports = withTM({
  // `@react-ssr/shared` 是 Monorepo 结构下的其他模块的包名
  transpileModules: ['@react-ssr/shared'],
});
```

> 坑点：虽然经过如上改造，Babel 会对其他子包进行编译，但是发现 Next.js 项目模块下的 Babel 插件配置（.babelrc）对子包范围内的代码并不生效。

其实这一点来源 Babel 7 对于配置的变化，Babel 7 新增了根（root）的概念，默认是当前工作目录，也就是 Next.js 项目模块的级别（packages/nextjs-ssr/），此时 Babel 缺少、也不会去读取他子包的插件配置。

Babel 推荐在所有 Monorepo 项目的根目录添加 `babel.config.js`，以此建立了 Babel 的核心概念。但这对于上述问题的解决还不够，在这里我通过设置 `rootMode: upward` 告诉 Babel 向上级寻找，Babel 会自动寻找 `babel.config.js` 并将其设置为 root 的值（[更多详细内容可查看官方文章 —— Config Files](https://babeljs.io/docs/en/config-files#project-wide-configuration)）。

具体配置如下。

```js
// next.config.js

module.exports = {
  webpack(config) {
    config.module.rules.forEach(rule => {
      // 这里的改动比较暴力，因为 Next.js 没有直接暴露更改内建 loader 参数的地方
      if (rule.use && rule.use.loader === 'next-babel-loader') {
        // 设置 babel 向上寻找 babel.config.js，然后将其所在的路径作为根（root）
        // 否则编译其他 package 时不会加载 babel 插件
        // https://babeljs.io/docs/en/config-files#project-wide-configuration
        rule.use.options.rootMode = 'upward';
      }
    });
    // ...
  },
};
```

如此一来，再将 Babel 插件配置在 `babel.config.js`，那么 Babel 插件在其他模块也会起作用了。

## 国际化语言渲染问题

在 `nextjs-ssr` 中，项目以 SSR 方式运行，在页面请求来临的同时，读取 cookies 就能知晓当前浏览器的语言设置信息，接着就能渲染出对应语言的页面并返回。

对于用户来说，当选择英文，首屏返回的页面就英文；选择了中文，返回的就是中文页面。

而对于静态部署的 `nextjs-static`，并没有动态渲染的能力，页面只有在返回到浏览后才能从 cookies 中读取到语言设置信息，进而将页面切换成对应的语言。

页面总有个初始语言，可是这样一来打开页面会有个语言切换的现象（默认语言与实际语言不符），但这个也不好避免。所以，`nextjs-static` 中的操作是一概将 Server 的国际化输出设置成 `...`，待脚本加载后会自动读取并切换成对应的语言。

# 其他问题

## SSR 部署期间的问题

在部署期间发生了一个由 `host` 字段引发的问题，导致 SSR 层的请求发生错误。

结合开头的时序图可以看到，发起 GraphQL 请求的角色有浏览器和 SSR 层，而 SSR 层发起请求时都来源于一个页面的访问。比如，访问主页 `/`（不是通过其他前端路由跳转来的），而且主页组件在 `getInitialProps` 生命周期中有请求，那么该请求会在 SSR 层发起。同样，这个请求需要携带 token、language 标识等信息，这些信息来源于页面请求的 Header，这步操作见代码。

```ts
// `packages/shared/src/layouts/ApolloWrap/index.tsx`

const authLink = setContext((_, { headers }) => {
  // 这里用于添加自定义的 headers 字段
  const reqHeaders: any = process.browser
    ? {}
    : // 当在 Server 端的时候，将来自 browser 的 headers 携带过去
      // host 也被包含在内。
      getProp(() => ctx.req.headers, {});
  return {
    headers: {
      ...headers,
      ...reqHeaders,
    },
  };
});
```

这里的 `ctx.req` 具体指的就是 `访问主页 /` 这次请求。接着，请求被发往 gql-server。

这里需要补充一下部署时候的具体情况，`nextjs-ssr` 和 `gql-server` 运行于 Docker 容器当中，同时在一个物理机上，通过 Nginx 转发请求。

那么上述流程会是这样。

```
1. 访问主页 `http://customer.example.com/`，发送请求到 `nextjs-ssr`
    请求内容：
      url: http://customer.example.com/
      headers:
        host:  http://customer.example.com/


2. Nginx 将请求转发到 nextjs-ssr，nextjs-ssr 发出 `getInitialProps` 中的请求
    请求内容：
      url: http://gql-server.example.com/
      headers:
        host:  http://customer.example.com/

3. Nginx 收到请求，发现 host 字段，又将请求转发到 `http://customer.example.com/`
    Nginx 默认配置在请求 URL 和 host 字段之间会以 host 优先

4. ... 死循环了，最终因为重定向过多，Nginx 返回对应错误码
```

上述问题的解决很简单，将 host 置空或设置成正确的值。关于 host 字段的作用，我的认识如下。

一个域名会被解析成 IP 对应到一台服务器，但这一台服务器上可能存在多个服务，在内部可以通过端口来区分，但出于各种原因，这台服务器往往只对外暴露部分端口，外部访问者这时候就可以额外通过 host 字段告诉服务器想要访问的服务。

# GraphQL 服务

GraphQL 的搭建基本是一个学习的过程，虽然写过一些 Node.js 脚本，但对于 Node.js Server 的应用还是知之甚少。

在编写完 demo 之后，感觉这个 `gql-server` 不算复杂，可能因为这个服务做的事情还是比较纯粹，只提供 GraphQL 服务。

各种框架都有对应的方案，可以是 express、koa 等等，这里选择了 fastify，再结合相应的 apollo-server，最后添加 GraphQL 的 schema 即可。

以上，都是马后炮 😅。

不过值得一提的是，这里有一个库，让 GraphQL 和 TypeScript 的结合变得十分美好。不过在介绍之前，先了解一下痛点。

了解过 GraphQL 之后会知道，GraphQL 的一大特点是强类型依赖，所以需要为服务编写很多的类型定义。

一开始的时候，老老实实在 graphql 文件中编写 GraphQL 的类型定义。然后，在 TypeScript 中又要写一遍类型定义，显得很重复。而且，写下来后会发现两者十分相似。

于是，开始寻找优化方案，从而发现了 [type-graphql](https://github.com/19majkel94/type-graphql)，结合了两者的使用。

> 提前说明注意点：该库十分依赖装饰器语法和元数据（Decorator Metadata），两者目前为止都还没成为标准，正式使用需慎重。

在 type-graphql 的基础上，只需要在 TypeScript 中编写 class 即可，class 会被转化为对应的 GraphQL 类型。

```ts
@ObjectType()
class Recipe {
  @Field(type => ID)
  id: string;

  @Field()
  title: string;

  @Field(type => [Rate])
  ratings: Rate[];

  @Field({ nullable: true })
  averageRating?: number;
}
```

上面的 class 会被转换成如下的类型。

```ts
type Recipe {
  id: ID!
  title: String!
  ratings: [Rate!]!
  averageRating: Float
}
```

剩余的、也是主要的工作就是编写 resolvers。

# 结语

本文也终于到了结束的时候，总感觉还有遗漏的地方，只怪总结得不够及时。

本文的 demo 基本是在老大哥（没错，又是那个杰哥）的基础上复刻的，本文最大的意义就是尽可能地将上述内容消化成自己的东西。如果能帮到此时的您，那更是本文的荣幸。

对于 SSR 感受还是不错的，首屏的体验也是实打实的；如果觉得添加一个 Node.js 有成本，也十分建议尝试 Prerender，同样能享受到首屏的效果。

对于 GraphQL 中间层的感受就有点爱恨交加了。字段查询、接口聚合、返回体自定义（不用忍受后端 😜）等功能都很好用，但是，得有人去维护一个个接口的对接，这一步也只能前端去做。不过总体而言还是很乐意去使用的。

本文罗里吧嗦地也写了不少，若发现不当之处，还望斧正，感激不尽！

---

参考链接 & 推荐阅读：

- [Next.js](https://github.com/zeit/next.js)
  - [Next.js 官方 examples，十分推荐](https://github.com/zeit/next.js/tree/canary/examples)
- [GraphQL](https://graphql.org/) - [中文](https://graphql.cn/)
- [Apollo GraphQL](https://www.apollographql.com/docs/)
  - [Apollo React](https://github.com/apollographql/react-apollo/)
  - [Apollo Client](https://github.com/apollographql/apollo-client)
  - [Apollo Server](https://github.com/apollographql/apollo-server)
- [Babel - Config Files](https://babeljs.io/docs/en/config-files#project-wide-configuration)
- [Fastify](https://github.com/fastify/fastify)
- [what-is-http-host-header](https://stackoverflow.com/questions/43156023/what-is-http-host-header)
- [Host - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host)
