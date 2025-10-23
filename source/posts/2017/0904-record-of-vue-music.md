---
title: vue-music记录
date: 2017-9-4 19:39:02
id: record-of-vue-music
categories: ['前端']
tags:
  - JavaScript
  - TypeScript
  - Vue
description:
---

使用 Vue（2.x）全家桶，仿造网易云音乐 pc 网页版制作的一个单页应用，接口使用[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)。

~~演示链接~~
[项目链接](https://github.com/daief/vue-music)

<!-- more -->

## 数据方面的处理简述

使用中：
[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

最初的做法：
~~一个关键的问题是如何获得歌曲的 url，先看看网易云的链接，比如 id 为`25640828`的歌曲，对应的 url 是`http://m10.music.126.net/20170917181558/f1d4858ba2af5098b54f5261d821a76d/ymusic/7244/d140/31c4/acec84bc90b4e474bd3eeda288ad5617.mp3`，显然是经过加密处理的。因为不知道加密方案，无法通过 id 去获取对应的 url，所以使用了`http://link.hhtjim.com/`外链转换，歌曲的 url 格式形如：`http://link.hhtjim.com/25640828.mp3`。如此就能方便地知道歌曲所对应的 url。~~

## 实现过程中的问题记录

偷懒是坏文明，然而我…………

### 项目打包（npm run build）之后静态资源路径错误

#### JS、CSS 等路径错误

webpack 配置：config/index.js

```javascript
build: {
  env: require('./prod.env'),
  index: path.resolve(__dirname, '../dist/index.html'),
  assetsRoot: path.resolve(__dirname, '../dist'),
  assetsSubDirectory: 'static',
  // 修改此处，默认是：assetsPublicPath: '/'
  assetsPublicPath: './',
  productionSourceMap: true,
  productionGzip: false,
  productionGzipExtensions: ['js', 'css'],
  bundleAnalyzerReport: process.env.npm_config_report
}
```

#### 打包后 CSS 中的图片路径错误

路径会出现 `/static/css/static/img` 这样的重复现象，在 `build/utils.js` 中添加一行

```javascript
if (options.extract) {
  return ExtractTextPlugin.extract({
    use: loaders,
    fallback: 'vue-style-loader',
    // 新增 publicPath: '../../'
    publicPath: '../../',
  });
} else {
  return ['vue-style-loader'].concat(loaders);
}
```

### 如何 watch 一个 vuex 中的状态

`stores/index.js`中，有一个 id 变量和对应的 getter

```js
export default {
  state: {
    id: 1
  },
  getters: {
    Id: state => state.id
  }
  mutations: {
    setId(state, newId) {
      state.id = newId
    }
  },
  actions: {
    setId({commit}, id) {
      commit('setId', id)
    }
  }
}
```

在想要 watch 的组件中

```javascript
import { mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters([
      'Id', // 与getters对应
    ]),
  },
  watch: {
    // 这样就可以在任何组件调用commit('setId', xxx);时watch到全局state中id的变化
    Id: function (newvalue, oldvalue) {
      // 处理
    },
  },
};
```

### 在 mounted 生命周期钩子中可以对 window 事件进行监听

```javascript
export default {
  // ...
  mounted() {
    // 对window滚动事件的监听
    window.addEventListener('scroll', this.appScroll);
  },
  // ...
};
```

### 在变量中保存静态图片路径，然后动态绑定到元素上

比如 App.vue，不能这样去做，因为 url 会被当成字符串处理，需要告诉 webpack 加载模块（此处指图片，图片也会被当成模块，`此处表述不知是否得当`）

```html
<template>
  <div>
    <img :src="url" alt="" />
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        url: './assets/avrtar.jpg',
      };
    },
    watch: {},
  };
</script>
```

修改写法，App.vue

```html
<template>
  <div>
    <img :src="url" alt="" />
  </div>
</template>

<script>
  // 导入
  import avatar from './assets/avrtar.jpg';
  export default {
    name: 'app',
    data() {
      return {
        // 使用
        url: avatar,
      };
    },
    watch: {},
  };
</script>
```

### 2018-03-24 Mac 下 npm install 时报错

1. `npm install` 失败
2. 终止安装后，提示更新 npm，`npm i -g npm` 失败
3. 权限问题使用 `sudo npm i -g npm`，删除 `node_modules` 后重新 `sudo npm install` 后成功
   - 2018-09-18 补充（Mac）：提示无权限时可能是因为用户组的原因，多半因为被设置成`root`，而当前用户组不是`root`，`ll`可查看文件信息 包含用户组信息，`chown -R user ./dir`可将`./dir`的用户组改为`user`

## 2018-11-02 重写计划

主要出于对 Vue 系列重新熟悉、学习的目的，并尝试使用 TypeScript 进行编写，基于 Vue 2.x、Vue Cli 3。

新的记录文章：{% post_link happy-vue-with-typescript %}
