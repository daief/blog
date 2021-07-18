---
title: 用 TypeScript 来写 Vue！
date: 2019-02-12 17:25:59
id: happy-vue-with-typescript
categories: ["前端", "TypeScript"]
tags:
  - Vue
  - TypeScript
keywords:
  - Vue
  - TypeScript
description:
---

本文不说明 webpack 的配置，简单介绍如何使用 TypeScript 来书写 Vue，阅读本文应同时对 TypeScript 和 Vue 有一定的了解。

<!-- more -->

如果你在为如何搭建一个支持 Vue in TS 的环境而苦恼，在这里我推荐使用官方脚手架 [Vue CLI 3](https://cli.vuejs.org/)来生成一个项目；或是来试试我自己编写的脚手架，你可以直接拷贝[这个例子](https://github.com/daief/jugg/tree/master/examples/ts-vue)。这两种方式都不需要你介入配置，可以直接开始代码的编写，日后再研究环境的配置。

编写本文时所使用的 Vue 版本为 2.x，TypeScript 版本为 3.x。

**以下介绍的用 TS 编写 Vue 组件的方式与原来的方式不兼容，请不要对原来的项目直接进行改造。**

## 差异一览

使用 JS 编写如下简单组件：

```html
<template>
  <div>
    <img :src="src" class="photo">
    <p class="description">{{description}}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      src: 'https://img2.vipcn.com/img2016/6/21/2016062150586477.jpg',
      description: 'Saber-阿尔托莉雅·潘德拉贡'
    }
  }
}
</script>
```

使用 TS 之后：

```html
<template>
  <div>
    <img :src="src" class="photo">
    <p class="description">{{description}}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Post extends Vue {
  src: string = 'https://img2.vipcn.com/img2016/6/21/2016062150586477.jpg'
  description: string = 'Saber-阿尔托莉雅·潘德拉贡'
}
</script>
```

可以看出写法上的改变比较大，首先一定得把 `script` 标签的 `lang` 设置为 `ts` 或 `tsx`；接着借助 `vue-property-decorator`，以**类声明**的方式编写 Vue 组件。

下面简单介绍 `vue-property-decorator` 的使用，详细 API 可参看[官方文档](https://github.com/kaorun343/vue-property-decorator#readme)，同时也要参照[vue-class-component](https://github.com/vuejs/vue-class-component)。因为：

> vue-property-decorator:
> This library fully depends on vue-class-component, so please read its [README](https://github.com/vuejs/vue-class-component) before using this library.

## 使用 vue-property-decorator

以下介绍包括，详情还请参照其中注释：

- data
- prop
- computed
- methods
- watch

```html
<!-- Post.vue -->
<template>
  <div @click="handleClick">
    <img :src="src" class="photo">
    <p class="description">{{description}}</p>
    <p>counter: {{Count}}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

@Component
export default class Post extends Vue {
  // data 属性
  src: string = 'https://ae01.alicdn.com/kf/HTB1hZDNdEuF3KVjSZK9762VtXXaK.png'
  count: number =  1

  // computed 实现
  get Count() {
    return `点击了${this.count}次`;
  }

  // 指定 description 为 prop
  @Prop({
    default: 'default description',
    /**
     * `required`、`type` 为 vue 运行时的检查
     */
    required: true,
    type: String
  })
  description!: string

  handleClick() {
    // 点击事件，改变 data，更新界面
    this.count += 1;
  }

  // mounted 生命周期钩子
  mounted() {
    console.log('mounted')
  }

  // watch
  @Watch('count')
  onCountChange(val: number, old: number) {
    console.log(`new value: ${val}, old value: ${old}`)
  }
}
</script>
```

在其他组件中使用 `Post` 组件：

```html
<!-- App.vue -->
<template>
  <div class="app">
    <h1>app</h1>
    <post description="Saber-阿尔托莉雅·潘德拉贡" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// 导入组件
import Post from '@/components/Post.vue';

@Component({
  // 组件注册
  components: {
    Post
  }
})
export default class App extends Vue {

}
</script>

```

本节需要注意一点，不要将点击事件、生命周期等方法写成箭头函数的形式，否则数据更新时界面不响应更新：

```html
<!-- ... 其他内容 -->
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Post extends Vue {
  handleClick = () => {
    // 结果界面不响应更新
    this.count += 1;
  }
}
</script>
```

## 加入 vuex

### 定义 store

下面定义一个 store，由 `store.ts`、`./stores/homeStore.ts` 两个文件构成，包含一个名为 `homeStore` 的 module，来看看具体实现。

```ts
/* store.ts */

import Vue from 'vue';
import Vuex from 'vuex';
// 从 homeStore 中导出类型和对象
import { IHomeState, homeStore } from './stores/homeStore';

Vue.use(Vuex);

// 定义 RootState
export interface RootState {
  homeStore: IHomeState;
}

export default new Vuex.Store<RootState>({
  modules: {
    homeStore,
  },
});
```

```ts
/* ./stores/homeStore.ts */

import { MutationTree, ActionTree } from 'vuex';
import { RootState } from '../store';

// 定义类型，描述 homeStore
export interface IHomeState {
  title: string;
}

const state: IHomeState = {
  title: 'home title',
};

export enum TYPES {
  SET_TITLE = 'SET_TITLE',
}

const mutations: MutationTree<IHomeState> = {
  [TYPES.SET_TITLE](s, newTitle: string) {
    s.title = newTitle;
  },
};

const actions: ActionTree<IHomeState, RootState> = {
  setTitle({ commit }, ele) {
    commit(TYPES.SET_TITLE, ele);
  },
};

export const homeStore = {
  namespaced: true,
  state,
  mutations,
  actions,
};
```

代码实现上可以说是没有变化，就是加了不少类型用于描述、规范。下一步来看看具体怎么在组件中使用。

### 使用 store

在此之前介绍一下 [vuex-class](https://github.com/ktsn/vuex-class#readme)，是专为 vuex 和 vue-class-component 制定的绑定工具，用于优化使用。

```html
<!-- Home.vue -->
<template>
  <div class="home">
    <h1>this is home page</h1>
    <p @click="changeTitle">
      title from store: {{homeStore.title}}
      <br>
      click to change
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import { IHomeState } from '@/stores/homeStore';

@Component
export default class Home extends Vue {
  /**
   * State 修饰后的属性时对应的 store 对象
   * 此处为 homeStore
   *
   * this.homeStore.title 与 this.$store.homeStore.title 相同
   */
  @State homeStore!: IHomeState;

  /**
   * Action 修饰后的属性是一个 function，即 store 中定义的 action
   * 以下的使用等价：
   *
   * this.changeTitleAc('new title')
   *
   * this.$store.dispatch('new title')
   */
  @Action('homeStore/setTitle') changeTitleAc!: Function;

  count = 0;

  changeTitle() {
    this.changeTitleAc(`get a new title - ${this.count}`);
  }
}
</script>
```

## 遇到的问题

### Property 'XX' does not exist on type 'YY'

有的时候我们会把一些对象挂载在 Vue 原型上，这样能方便在组件中的使用，以 lodash 为例。

入口文件 index.ts：
```ts
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import * as _ from 'lodash';

Vue.config.productionTip = false;

// 将 lodash 挂载到 Vue 原型
Vue.prototype._ = _;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#root');

```

在 Home.vue 组件中使用：
```html
<script lang="ts">
// ...

@Component
export default class Home extends Vue {
  mounted() {
    // 使用 lodash
    console.log(this._.lowerCase('AABB'));
  }

  // ...
}
</script>
```

这时候不出 TS 的编译会抛给你一个错误，而这实际上是个类型描述问题，对于 TS 编译器来说它并不知道 `_` 的存在以及描述，这时候当我使用这个类型未知的内容时就会被禁止。

```bash
Property '_' does not exist on type 'Home'.
```

所以新建一个类型文件来告诉 TS 什么是 `_`：

```ts
// src/@types/extend-vue.d.ts
// https://stackoverflow.com/questions/43142304/how-to-augment-the-vue-class-and-keep-typescript-definition-in-sync/43232151#43232151
// 1. Make sure to import 'vue' before declaring augmented types
import Vue from 'vue';
import * as _ from 'lodash';

// 2. Specify a file with the types you want to augment
//    Vue has the constructor type in types/vue.d.ts
declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
  interface Vue {
    _: typeof _;
  }
}
```

## 结语

在学习过程中可以发现，TypeScript 和 Vue 2 的结合并不十分契合，可以看看尤大对此的说法——[值得一看，Vue 作者尤雨溪的回答【TypeScript 不适合在 vue 业务开发中使用吗？】](https://juejin.im/entry/5c5d59c7e51d45013e50b41b)。

但是也不是说不能用，基于现状，这是我所知用 TS 编写 Vue 较好的方式了。或者，来期待 Vue 3 的发布。

最后，介绍一下我用 TS 写的 [Vue 项目](https://github.com/daief/vue-music)，项目进度很慢并随时可能 TJ。

---

参考链接 & 相关阅读:

- [vue + typescript 项目起手式](https://segmentfault.com/a/1190000011744210)
- [vue + typescript 进阶篇](https://segmentfault.com/a/1190000011878086)
- [有必要将Vue项目重构到Typescript吗?](https://sunskyxh.github.io/2018/03/12/dose-refactoring-vue-project-into-typescript-deserved/)
- [Vue 3.0 Updates](https://docs.google.com/presentation/d/1yhPGyhQrJcpJI2ZFvBme3pGKaGNiLi709c37svivv0o/edit#slide=id.g4689c30700_0_35)
- [Vue 版 Ant Design Pro](https://github.com/qidaizhe11/element-pro)
- [vue-vuex-typescript-demo](https://github.com/qidaizhe11/vue-vuex-typescript-demo)
- [vue-property-decorator](https://github.com/kaorun343/vue-property-decorator#readme)
- [vue-class-component](https://github.com/vuejs/vue-class-component)
- [vuex-class](https://github.com/ktsn/vuex-class#readme)
