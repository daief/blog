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

静态导出时的样式，子进程，antd/style/

workspaces 模式下 ts 文件解析

---

这段时间新建了两个后台项目，都是基于 [Next.js](https://github.com/zeit/next.js) 搭建。第一个项目上了 `SSR（Server-Side Rendering）` + [GraphQL](https://graphql.org) 服务；第二个项目用了 `next export（Next.js 页面预渲染、静态导出）` + `GraphQL Client`。两者用词虽然差不多，但实际上并不是一回事，最明显的一个区别在于是否需要 `Nodejs 中间层`；其他方面会在后文提及。


本文主要内容包括两个项目的介绍，并记录一些在开发过程中遇到的概念、问题和解决。阅读此文需要对 SSR、webpack 等有一些基础了解，以及对应 next 版本为 8.0.3。

<!-- TODO -->
建议结合这篇：{% post_link get-a-ssr-demo-step-by-step %}，希望对您有帮助。

<!-- more -->

这里简单描述一下 SSR：



## 项目一

### 简介

该项目是一个对内的、管理各种应用的后台（简称认证中心），其中的一个功能是实现各个应用间的[单点登录（SSO）](https://en.wikipedia.org/wiki/Single_sign-on)。

Java 端基于 [JWT（Json web token）](https://en.wikipedia.org/wiki/JSON_Web_Token) 实现授权认证，前端应用在请求时要把 token 加到请求头当中，同时也会将 token 缓存于 localStorage。而这里的每个应用都有一个不同的二级域名（如 a.example.com、b.example.com），localStorage 由于跨域限制，前端应用之间不能共享 token。

因此，这里的方案是把 token 存储在 cookie 里，并设置 Domain 为根域名（.example.com）。如此一来各个应用之间直接就共享 token，而且每个应用不再需要维护 token。

因为这是一个对内的应用，同时出于对技术的追求，前端表示添加 Node.js 中间层来做 cookie 的控制，而 Java 端一切保持不变。加上了 Node 层之后，又顺理成章地加上了 SSR、GraphQL Server。

整体时序图如下。

<!-- 这里放个时序图 -->

### 遇见的一些问题

主要框架：

- TypeScript
- Next.js
- antd
- apollo-\* 系列（apollo-server-fastify、apollo-client ……）

#### 引用样式文件时报错

这个应该是使用 SSR 时候的经典问题了。在 Next.js 中，这个问题主要有两个原因，简单概括为：一是因为 Next.js 的 webpack 配置中默认没带 CSS、Less 的配置；二是 SSR 框架的运行特点。

添加相应的 webpack 配置，如使用官方的配置扩展插件：[@zeit/next-css](https://github.com/zeit/next-plugins/tree/master/packages/next-css)、[@zeit/next-less](https://github.com/zeit/next-plugins/tree/master/packages/next-less)，然后在 `next.config.js` 中使用：

```js
// next.config.js
const withCSS = require("@zeit/next-css");
module.exports = withCSS(
  withLess(
    // 为了支持 ts
    withTypescript({
      /* config options here */
    })
  )
);
```

如此一来，项目中就能正常引用样式文件了。

<!-- TODO -->
库中样式
css module

#### 应用图片等静态文件

> `import img from './a.png'` 时
