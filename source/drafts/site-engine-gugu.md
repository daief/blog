---
title: 博客框架 —— gugu
date: 2021-07-25 22:18:00
id: site-engine-gugu
categories: ['前端']
tags:
  - Vite
  - Vue3
keywords:
  - 博客框架
  - gugu
description:
---

很久之就一直想把博客改成单页的，而中间发生了不少咕咕咕（~~懂得都懂，不懂的我也不用再说了 🐶~~）的事情，别说改造了，连文都没更新。在咕了大半年之后，终于完成了大改造，将原来使用的 [Hexo](https://hexo.io/) 替换成了个人实现的博客框架 [gugu](https://github.com/daief/blog/tree/master/packages/gugu)。

<!-- more -->

## 为什么？

最初的想法是想将整个博客应用改造成单页应用，想着带来不一样的体验；其次想尝试一些新的东西、想实践一些想法，所以就去做了。

## 技术栈的选择

工作上一直在使用 React，所以在写个人项目的时候就想用些不一样的。正巧 Svelte 和 Vue3 都在风头上，Tailwind CSS 热度也不小，刚好都可以接触一下来练练手。

虽然最初尝试了 Svelte，照着官网教程写下来十分容易上手，结合 VSCode 相关的插件，编程体验也不错。但考虑到对恰饭的帮助，没有去过多深入，最终是选择了 Vue3。

构建工具方面对 Vite 和 Webpack5 都进行了尝试：Webpack5 因为没有使用什么新的特性，整体用下来没有什么新的感受；当使用 Vite 之后，就有很多新的感受，只能说 Vite 真香，速度的确快、配置也简单，只能再说一次很香了。

所以最终的技术栈组成是：

- Vue3
- Vite
- Tailwind CSS
- Less
- TypeScript

全文另一项重点技术的应用是 SSR 和 SSG。因为博客类应用需要 SEO、以及为了首屏更好地体验，所以不能仅仅只使用客户端渲染，故引出了 SSR；但自己又没有服务器，也不想专门搞个服务器，只想用纯静态托管的方式达到目的，故进一步引出了 SSG。加上博客本身都是静态的内容，使用 SSG 再合适不过了。

## 实践过程

### Hexo 主题

博客原本就是基于 Hexo 框架的，因此最初的想法是构建一套 Hexo 主题来达到目的。虽然完成了一套功能达到目的的主题，但心里感觉是不够痛快，不过这里还是简要记录一下实现过程中涉及的主要部分，处理好以下主要部分，基本就能基于 hexo 走通了。

半成品的主题：[hexo-theme-spa](https://github.com/daief/hexo-theme-spa)。

#### Layout：

只需保留一个 vue 文件，作为整个应用的入口组件：

```html
<template>
  <App />
</template>

<script lang="ts">
  import App from '@/App.vue'; // 另外存储源码的地方
  import { defineComponent } from 'vue';

  export default defineComponent({
    components: { App },
    name: 'Index_layut',
  });
</script>
```

#### 扩展 renderer：

```js
hexo.extend.renderer.register('vue', 'html', async (data) => {
  // 导入 webpack 或 vite 构建器
  const build = require('./compile');

  // 启动构建服务，同时构建 client 和 server 端两份 bundle
  const { clientManifest } = await build();

  // 引用上一步构建的 server 结果
  const { renderHtml } = require('../source/ssr/main');

  // SSR 渲染出首屏 html，内部实际上就是调用 @vue/server-renderer 的 renderToString
  const htmlStr = await renderHtml(data, clientManifest);

  // 将结果返回，hexo 会输出成静态 html
  return htmlStr;
});
```

#### 路由页面的处理

需要注册一个 `generator`，枚举站点所涵盖的页面：

```js
hexo.extend.generator.register('spa', function (locals) {
  const { generator } = this.theme.config;
  const { per_page: perPage } = generator;

  const result = [
    // 文章分页
    {
      path: '',
      data: { __index: true },
    },
    ...paginationUtil(locals.posts, {
      perPage,
      pathPattern: 'page/%d/',
      data: { __index: true },
    }),
    { path: 'categories/' },
    // category 分页
    ...locals.categories.reduce((rs, category) => {
      if (!category.length) return rs;
      return [
        ...rs,
        { path: category.path },
        ...paginationUtil(category.posts, {
          perPage,
          pathPattern: category.path.replace(/\/?$/, '') + '/page/%d/',
        }),
      ];
    }, []),
    // tag 分页
    ...locals.tags.reduce((rs, tag) => {
      if (!tag.length) return rs;
      return [
        ...rs,
        { path: tag.path },
        ...paginationUtil(tag.posts, {
          perPage,
          pathPattern: tag.path.replace(/\/?$/, '') + '/page/%d/',
        }),
      ];
    }, []),
    // 归档 archives
    { path: 'archives/' },
    ...paginationUtil(locals.posts, {
      perPage,
      pathPattern: 'archives/page/%d/',
    }),
    // 404
    {
      path: '404.html',
    },
  ].map((it) => ({
    layout: ['index'],
    ...it,
  }));

  return result;
});
```

#### 数据的处理

当页面运行在浏览器之后，路由模式转变为前端路由，页面切换后数据需要异步拉取，这里就可以借助 `server_middleware` 钩子：

```js
hexo.extend.filter.register('server_middleware', function (app) {
  app.use(function (req, res, next) {
    if (/^\/json\/.*\.json$/i.test(req.url)) {
      const key = req.url.replace(/^\/json\//i, '').replace(/\.json$/i, '');
      const { renderData } = loadModule('../source/ssr/main');
      const path = Buffer.from(key, 'base64').toString();
      const data = renderData(path, savedLocals);
      res.writeHead(200, {
        'Content-type': 'application/json',
      });
      res.write(JSON.stringify(data));
      res.end();
      return;
    }
    next();
  });
});
```

而构建的时候，只需遍历每个路由，将每个路由页面所需的数据写入静态的 json 文件，这样一来数据也静态化了。再使用约定好的方式将路由与 json 文件进行映射，最终前端路由切换时只需去请求对应的 json 即可，即整个站点就单页化了。

PS：hexo 运行时会将 Markdown 文件序列化，将所有数据存储于一个小型的、运行时的数据库，可通过 `hexo.model('Post')` 的形式获取到具体的数据，数据库的底层是基于 [warehouse](https://github.com/hexojs/warehouse)，支持丰富灵活的查询方式。

### 自定义框架 - gugu

基于 hexo 就得遵循它的一套规则，有些细节还总是得翻看源码，写起来也不够自由，总体就感觉不痛快，所以又转换思路：从头完整地写了一个简单的博客框架。

过程就简单记一下，因为核心思路与上述主题的实现是相近的，而且一些数据的处理也借鉴了 hexo，就是底层构建更换成 vite 了。

核心依旧是 SSR 渲染，而 vite 的[服务端渲染](https://cn.vitejs.dev/guide/ssr.html)其实在官网上写得十分清楚了。

数据的处理同样是两种情况：

- 开发时：使用 expres 中间件的方式返回页面数据
- SSG：将数据写入静态 json

SSG 的过程就是在开发服务的基础上，枚举所有路由去访问本地服务，将响应的 HTML 输出成一个个 html 文件。

源码地址：[gugu](https://github.com/daief/blog/tree/master/packages/gugu)。

最后要提的一点是 `gugu` 这个名字，`gugu` 即`咕咕~`，表示作者鸽了自己大半年。
