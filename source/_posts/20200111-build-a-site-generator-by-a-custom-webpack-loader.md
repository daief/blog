---
title: 自定义 webpack loader 来实现简单的站点生成器
date: 2020-01-11 15:05:40
id: build-a-site-generator-by-a-custom-webpack-loader
categories: ['前端']
tags:
  - webpack
  - loader
keywords:
  - webpack loader
  - site generator
  - antd
  - documentation
description:
---

本篇内容实际上在公司内部分享时有过讲解，通过编写一个自定义的 webpack loader，实现方便快速地构建一个文档类型的网站。现在重新实现了一下，并将这个部分的内容与 `jugg` 进行了结合，故自己再次整理一遍。

<!-- more -->

目的：解析 Markdown 文件，生成页面；在过程中，同时对符合规则的代码块进行解析、执行，最终渲染出 demo。

通篇的实现思路其实十分简单，重点是能够实现 `解析 Markdown 文件、解析其中代码块`，最后将这些解析的结果丢进项目中，渲染部分根据数据源可自由实现，最后打包、部署一下就完成了。

> 这时候会想到 `mdx` 之类的实现，或是 docsify、Docusaurus、VuePress、bisheng 等优秀的开源站点生成器，但这都无法阻止自己想要折腾的心。

# 预览

效果预览地址：<https://daief.tech/jugg/#/jugg-plugin-doc/packages/jugg-plugin-doc/demos>。

项目目前的特点：

- 主题风格来源于 [Ant Design](https://ant.design/index-cn) 文档。
- 基于 React、antd 编写
- 可在 Markdown 中运行代码块，支持
  - 普通的代码块
  - 渲染 React 组件
  - 渲染 Vue 组件

> 功能还在完善中...

这里要十分感谢 Ant Design，因为这里的主题就是借鉴（~~抄~~）来的。

# 自定义 loader

目的：编写一个处理 Markdown 的 webpack loader —— md-loader，实现 Markdown 文件以及代码块的解析。

关于 loader 的编写可参照官方文档：<https://webpack.docschina.org/contribute/writing-a-loader/>。值得一提的是，编写 loader 建议搭配 `loader-utils` 一起使用，使得开发更加方便且不容易出错。

只记一些我的个人想法和实现，有的可能还与官方推荐的 `用法准则` 有所冲突。

md-loader 并不算复杂，每个 Markdown 经过 md-loader 转换成 JS 能够处理的模块，它的结果看起来会像是下面这样：

```js
export const metadata = {
  // markdown 的元数据部分
};

// 整个 markdown 对应的 html 结果
export const html = `...`;

// 可执行代码块的结果
export default [
  {
    // 代码块标题
    title: '',
    // 代码块的描述部分
    description: '',
    // 代码块字符
    code: '',
    // 代码块 html 字符串，包含 highlight 标签
    codeHtml: '',
    // 代码块类型，TSX | VUE
    demoType: 'TSX',
    module: require('/the-demo-path.tsx'),
  },
  {
    title: '',
    description: '',
    code: '',
    codeHtml: '',
    demoType: 'VUE',
    module: require('/the-vue-demo-path.vue'),
  },
];

// 其他需要的内容
// export ...
```

也就是说，接入 md-loader 之后，在代码中就可以这么写：

```ts
// 导出需要的内容
import codeList, { metadata, html } from './your-markdown.md';
```

最后写一下我自己不确定的部分，我不确定这是否是合理的实现方式，但目前为止这是我达到目的所用的最好方法了：

- 将 Markdown 中的代码块解析出来，单独地生成一个文件，存放在一个缓存目录，文件类型可能是 `tsx?`、`vue` 或 `jsx?`
- 在代码块 `module` 字段通过 `require` 的方式重新引用回项目

**好处：**

- 不需要链式地配置 loader 进行处理、不需要考虑 demo 的文件类型

即不需要出现下面这种配置：

```js
// webpack.config.js
export default {
  // ...
  module: {
    rules: [
      {
        test: /\.md/,
        use: [
          'ts-loader'
          'md-loader',
        ]
      }
    ]
  }
};
```

只要对每种类型分别配置完即可生效：

```js
// webpack.config.js
export default {
  // ...
  module: {
    rules: [
      {
        test: /\.md$/,
        use: ['ts-loader'],
      },
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
      },
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },
    ],
  },
};
```

## 具体实现

具体的实现就不贴了，可以查看[这里的实现](https://github.com/daief/jugg/blob/master/packages/jugg-plugin-doc/src/loader/md.ts)。

# 站点生成器

我叫它这个名字只是因为这样看起来比较高级，刚好又具有了这样的功能。

项目地址：[jugg-plugin-doc/site](https://github.com/daief/jugg/tree/master/packages/jugg-plugin-doc/site)。

该部分的内容大概如下：

- 读取用户配置项，寻找出所有匹配的 Markdown 源文件列表
- 根据源文件列表动态数据源文件： `site/mds.tsx`
- 搭建一个前端项目，根据数据源渲染出页面
- 最后打包成静态文件就结束了

# 结语

因为，本篇内容在 [Github 上有具体的实现](https://github.com/daief/jugg/tree/master/packages/jugg-plugin-doc)，所以细节都没有展开。另外实现思路也比较简单，所以通篇可能表现得比较简略，不过事实也就是这样。

㊗ 新年快乐。
