---
title: Vue, vue-router, vuex项目构建
date: 2017-7-20 16:48:54
id: build-a-vue-project
categories: ['前端']
tags:
  - JavaScript
  - Vue
description:
---

> Vue.js（读音 /vjuː/，类似于 view） 是一套构建用户界面的渐进式框架。与其他重量级框架不同的是，Vue 采用自底向上增量开发的设计。Vue 的核心库只关注视图层，它不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与单文件组件和 Vue 生态系统支持的库结合使用时，Vue 也完全能够为复杂的单页应用程序提供驱动。
> 本篇记录如何构建 vue，vue-router，vuex 项目的步骤。

<!-- more -->

[简单 demo](https://github.com/daief/vue-demo)
在项目的`src/`中进行工作

[Vue.js 官方教程](https://cn.vuejs.org/v2/guide/)
[vue-router 官方中文教程](https://router.vuejs.org/zh-cn/)
[vuex 官方中文教程](https://vuex.vuejs.org/zh-cn/)

## vue-cli 创建项目

### vue.js 项目

使用`npm`需要提前安装 node.js，因为 node.js 自带了`npm`模块，调试的时候也需要用到 node.js，需要一些对`npm`的认识，另外需要一些`webpack`的知识，不需要自己配置的时候问题不大，根据教程键入命令行即可

创建空文件夹，在当前目录下打开命令行工具，使用 vue-cli：

```bash
# 全局安装 vue-cli
$ npm install --global vue-cli

# 创建一个基于 webpack 模板的新项目
$ vue init webpack vue-example

? Project name vue-example
? Project description A Vue.js project
? Author DeFeNG <1437931235@qq.com>
? Vue build standalone
? Install vue-router? No    #是否安装vue-router
? Use ESLint to lint your code? No  # 是否使用ESLint规范代码风格
? Setup unit tests with Karma + Mocha? No   # 是否安装测试
? Setup e2e tests with Nightwatch? No

  vue-cli · Generated "vue-example".

  To get started:

    cd vue-example
    npm install
    npm run dev

  Documentation can be found at https://vuejs-templates.github.io/webpack


# 安装依赖，走你
$ cd vue-example

# 安装依赖模块，根据package.json的依赖安装，等待即可
$ npm install

# 开启本地服务器进行调试，默认localhost:8080
# 改动代码页面能够自动更新，ctrl+c可停止服务
$ npm run dev

# 将最终代码打包到dist/目录下
$ npm run build
```

### 安装 vue-router

`vue init webpack vue-example`的时候，是否安装`vue-router`选择 yes 即可

### 安装 vuex

[参考来源:http://www.wdshare.org/article/58dc8ec813a809c753831529](http://www.wdshare.org/article/58dc8ec813a809c753831529)

安装 vuex 模块，在根目录下：

```bash
$ npm install --save vuex   # --save相对--global，只在当前目录安装
```

创建以下路径文件`/src/stores/index.js`并添加如下代码:

```javascript
// 引入依赖
import Vue from 'vue';
import Vuex from 'vuex';
// 使用vuex
Vue.use(Vuex);
// 引入state模块
import states from './states';
import mutations from './mutations';
import actions from './actions';
/*
 * 第一种 state模块化
 * 适合大型项目以及状态多的项目写法
 * 注：模块化状态只是模块化state不分，其余getters，mutations，actions，是不分模块的，注意不要重命名
 */
// vuex 模块
// const index = {
//   state: states,
//   mutations: mutations,
//   actions: actions
// }
//
// const store = new Vuex.Store({
//   modules: {
//     index: index
//   }
// })
/*
 * 第二种 不分模块状态共享
 * 适合中小型项目以及状态少的项目写法
 */
const store = new Vuex.Store({
  state: states,
  mutations: mutations,
  actions: actions,
});

export default store;
```

创建/src/stores/states/index.js 添加如下代码

```javascript
// states
const states = {};
export default states;
```

创建/src/stores/mutations/index.js 添加如下代码

```javascript
// mutations
const mutations = {};
export default mutations;
```

创建/src/stores/actions/index.js 添加如下代码

```javascript
// actions
const actions = {};
export default actions;
到此vuex的引入和目录搭建已经完了;
```

在`main.js`中引入:

```javascript
import Vue from 'vue';
import App from './App';
import router from './router';

// 引入vuex创建的store实例，路径 './stores' 为 './stores/index.js'的简写
import store from './stores';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store, // store: store的简写
  template: '<App/>',
  components: { App },
});
```

> `stores/`结构不固定，[可使用官方的推荐](https://vuex.vuejs.org/zh-cn/structure.html)：

```bash
store
  ├── index.js          # 我们组装模块并导出 store 的地方
  ├── actions.js        # 根级别的 action
  ├── mutations.js      # 根级别的 mutation
  └── modules
    ├── cart.js         # 购物车模块
    └── products.js     # 产品模块
```
