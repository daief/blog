---
title: webpack学习
date: 2017-7-20 16:52:48
id: learn-webpack
categories: ["前端"]
tags:
  - JavaScript
  - webpack
description:
---

> webpack 是近期最火的一款模块加载器兼打包工具，它能把各种资源，例如 JS（含 JSX）、coffee、样式（含 less/sass）、图片等都作为模块来使用和处理。
> 我们可以直接使用 require(XXX) 的形式来引入各模块，即使它们可能需要经过编译（比如 JSX 和 sass），但我们无须在上面花费太多心思，因为 webpack 有着各种健全的加载器（loader）在默默处理这些事情。

[webpack 官网](http://webpack.github.io/)

<!-- more -->

[webpack-demo](https://github.com/daief/webpack-demo)
-- [参考仓库 https://github.com/ruanyf/webpack-demos](https://github.com/ruanyf/webpack-demos)
运行 demo 需要先进入目录执行`npm install`安装依赖

## 全局安装 webpack 和 webpack-dev-server

```bash
#全局安装
npm i -g webpack webpack-dev-server
```

启动服务器，在http://127.0.0.1:8080查看运行效果

```bash
$ webpack-dev-server
```

打包生成 bundle.js

```bash
$ webpack
```

## entry file

Webpack 遵循 webpack.config.js 的配置来构建生成 bundle.js —— [demo1](https://github.com/daief/webpack-demo/tree/master/demo1)

```javascript
// webpack.config.js
module.exports = {
  entry: "./main.js",
  output: {
    filename: "bundle.js"
  }
};
```

多个入口文件(Multiple entry files) [demo2](https://github.com/daief/webpack-demo/tree/master/demo2)
webpack.config.js

```javascript
module.exports = {
  entry: {
    bundle1: "./main1.js",
    bundle2: "./main2.js"
  },
  output: {
    filename: "[name].js"
  }
};
```

## Babel-loader

Loaders 是能够将你 app 的资源文件进行转换的预处理程序。比如 Babel-loader 可以将 JSX/ES6 文件转换成 js 文件。 [demo3](https://github.com/daief/webpack-demo/tree/master/demo3)

webpack.config.js 暂时还不清楚 module 的写法

```javascript
module.exports = {
  entry: "./main.jsx",
  output: {
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: "babel-loader?presets[]=es2015&presets[]=react"
      }
    ]
  }
};
```

> 运行之前确保安装了相关依赖模块

```bash
npm install --save react react-dom
npm install --save-dev babel-core babel-loader babel-preset-es2015 babel-preset
```

## CSS-loader

Webpack 允许在 js 文件中 require CSS 文件，之后使用 CSS-loader 预处理 CSS 文件
[demo4](https://github.com/daief/webpack-demo/tree/master/demo4)
你必须要两个 loaders 去转换 CSS 文件。第一个是 CSS-loader 去读取 CSS 文件，另一个是 Style-loader 去插入样式标签到 HTML 页面。

webpack.config.js

```javascript
module.exports = {
  entry: "./main.js",
  output: {
    filename: "bundle.js"
  },
  module: {
    loaders: [{ test: /\.css$/, loader: "style-loader!css-loader" }]
  }
};
```
