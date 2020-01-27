---
title: 编译 Vue 单文件组件至 JS 文件
date: 2019-11-28 17:34:26
id: compile-vue-file-to-js-file
categories: ['前端']
tags:
  - Vue
keywords:
  - vue
  - vue component compiler
  - npm module
description:
---

在开发 Vue 的组件库时，该如何将 `vue` 文件转换为 `commonjs` 或是 `ES Module` 规范的 `js` 文件，最后提供给他方使用？

在这样的场景下，展开标题内容的研究与实践。

<!-- more -->

# 前言

目标：

- 开发一个 npm 模块，内容是与 Vue 相关的组件库
- 其中包含多个组件，支持用户选择按需引用的方式

开发准备：

- 源码直接采用 Vue 单组件文件的方式（样式除外，最终使用时再另行引入）
- 脚本部分使用 ES6+ 语法、TypeScript

> 倘若组件库的内容无需考虑按需的方式，可使用常规开发 npm module 的方式，私以为借助 webpack 与 vue-loader 是比较简便的。
>
> webpack 当然也能达到单文件编译的效果，下文会进行介绍。

# 个人方案

抛砖引玉，先介绍下自己探索后所使用的方式，另外该方式的另一个目的是与本人开发的一个[小工具（jugg）](https://github.com/daief/jugg)结合使用。

其实我的方案，就是在开源库上套了下壳，主要依赖了

- @vue/component-compiler
- typescript

关键部分就很简单了

1. 使用 `createDefaultCompiler` 实例化 `compiler`
2. 使用 `compiler` 获取到 `descriptor`（描述符）对象，该对象包含三部分，对应 `模板 template`、`脚本 script` 和 `样式 style`
3. 最后组装成一个对象，包含 JS 代码块以及 Map 信息

以上，是 `@vue/component-compiler` 的使用，理论上到这里就结束了，但现实总不那么美好。当在 vue 文件中使用 TS 后，上述操作所产生的结果文件中会存在问题。

所以，我在中间加了一个 TS 编译的步骤，手动更新 `descriptor` 的脚本部分，代码大概如下。

> @vue/component-compiler 中有 preprocessorOptions 的选项，看起来像是编译前的一些选项，但实在没找到相关的使用资料，[源码中也只是作了个赋值操作](https://github.com/vuejs/vue-component-compiler/blob/c8c7d3fb460e7fa4a341027bfb49cd7a17fe09e8/src/compiler.ts#L81)。

```js
const { assemble, createDefaultCompiler } = require('@vue/component-compiler');
const ts = require('typescript');

/**
 * @param content {string} vue 单文件字符内容
 * @param filename {string} 文件名
 */
function compileVueFile(content, filename) {
  const compiler = createDefaultCompiler();
  const descriptor = compiler.compileToDescriptor(filename, content);

  // 手动提前编译
  // ❗️保留 ES Module，方便后续的一些操作
  descriptor.script.code = ts.transpile(
    descriptor.script.code,
    {
      target: ts.ScriptTarget.ES2015,
      module: ts.ModuleKind.ESNext,
      importHelpers: true,
    },
    filename,
  );

  // 组装
  const result = assemble(compiler, filename, descriptor);

  return result;
}
```

优化：默认方式会在结果文件中保留一些 helper 方法的定义，如果结果文件比较多，每个文件中都会重复定义了，所以可以提取出来，改成统一引用的方式。

可使用如下修改：

```js
// const result = assemble(compiler, filename, descriptor);
const result = assemble(compiler, filename, descriptor, {
  normalizer: '~vue-runtime-helpers/dist/normalize-component.js',
  styleInjector: '~vue-runtime-helpers/dist/inject-style/browser.js',
  styleInjectorSSR: '~vue-runtime-helpers/dist/inject-style/server.js',
});
```

描述一下使用效果，有如下源码文件 `a.vue`:

```html
<template>
  <div><Custom /></div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import Custom from 'xx-lib/Custom.vue';

  @Component({
    components: {
      Custom,
    },
  })
  export default class extends Vue {}
</script>
```

可得到如下结果：

```js
/* script */
import { __decorate } from 'tslib';
import { Component, Vue } from 'vue-property-decorator';
import Custom from 'xx-lib/Custom.vue';
let default_1 = class extends Vue {};
default_1 = __decorate(
  [
    Component({
      components: {
        Custom,
      },
    }),
  ],
  default_1,
);
const __vue_script__ = default_1;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c('div', [_c('Custom')], 1);
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

/* style */
const __vue_inject_styles__ = undefined;
/* scoped */
const __vue_scope_id__ = undefined;
/* module identifier */
const __vue_module_identifier__ = undefined;
/* functional template */
const __vue_is_functional_template__ = false;
/* component normalizer */
import __vue_normalize__ from 'vue-runtime-helpers/dist/normalize-component.js';
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = __vue_normalize__(
  { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
  __vue_inject_styles__,
  __vue_script__,
  __vue_scope_id__,
  __vue_is_functional_template__,
  __vue_module_identifier__,
  false,
  undefined,
  undefined,
  undefined,
);

export default __vue_component__;
```

这是优化了 helper 定义的结果，如果保留 helper 的定义，会有这样的差异（细心的同学一定发现 TS 的编译同样将 helper 提取到 tslib 中了）：

```diff
/* component normalizer */
-import __vue_normalize__ from 'vue-runtime-helpers/dist/normalize-component.js';
+function __vue_normalize__(
+  template, style, script,
+  scope, functional, moduleIdentifier, shadowMode,
+  createInjector, createInjectorSSR, createInjectorShadow
+) {
+  const component = (typeof script === 'function' ? script.options : script) || {}
+
+  // For security concerns, we use only base name in production mode.
+  component.__file = "/sandbox/src/vue/c.vue"
+
+  if (!component.render) {
+    component.render = template.render
+    component.staticRenderFns = template.staticRenderFns
+    component._compiled = true
+
+    if (functional) component.functional = true
+  }
+
+  component._scopeId = scope
+
+  if (false) {
+    let hook
+    if (false) {
+      // In SSR.
+      hook = function(context) {
+        // 2.3 injection
+        context =
+          context || // cached call
+          (this.$vnode && this.$vnode.ssrContext) || // stateful
+          (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
+        // 2.2 with runInNewContext: true
+        if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
+          context = __VUE_SSR_CONTEXT__
+        }
+        // inject component styles
+        if (style) {
+          style.call(this, createInjectorSSR(context))
+        }
+        // register component module identifier for async chunk inference
+        if (context && context._registeredComponents) {
+          context._registeredComponents.add(moduleIdentifier)
+        }
+      }
+      // used by ssr in case component is cached and beforeCreate
+      // never gets called
+      component._ssrRegister = hook
+    }
+    else if (style) {
+      hook = shadowMode
+        ? function(context) {
+            style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot))
+          }
+        : function(context) {
+            style.call(this, createInjector(context))
+          }
+    }
+
+    if (hook !== undefined) {
+      if (component.functional) {
+        // register for functional component in vue file
+        const originalRender = component.render
+        component.render = function renderWithStyleInjection(h, context) {
+          hook.call(context)
+          return originalRender(h, context)
+        }
+      } else {
+        // inject component registration as beforeCreate hook
+        const existing = component.beforeCreate
+        component.beforeCreate = existing ? [].concat(existing, hook) : [hook]
+      }
+    }
+  }
+
+  return component
+}
```

总之，就得到了一个在常规环境中能运行的 JS 文件了。最后，分别降级编译到 ES Module、commonjs 规范的目录下，我们的目标也基本达成了。

下面是在线的 codesandbox 例子，可直接更改并查看效果。

<iframe
  src="https://codesandbox.io/embed/compile-vue-file-to-js-file-nb09i?fontsize=14&hidenavigation=1&theme=dark&view=editor"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="compile-vue-file-to-js-file"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## jugg 中的应用

顺便介绍一下上述内容在 jugg 中的实际应用效果，该部分 demo 的地址：<https://github.com/daief/jugg/blob/master/examples/ts-lib/package.json>。

源码结构。

```bash
src
├── function
│   └── index.ts
├── index.ts
├── react-components
│   └── Button
│       ├── index.tsx
│       └── style
│           ├── index.less
│           └── index.ts
├── shims-vue.d.ts
├── style.ts
└── vue-components        # vue 组件部分
    ├── Button
    │   ├── button.vue
    │   ├── index.ts
    │   └── style
    │       ├── index.less
    │       └── index.ts
    ├── Toast
    │   ├── SubVue.vue
    │   ├── Toast.vue
    │   └── index.ts
    └── mixins
        └── base.ts
```

简单地通过使用 `jugg build & jugg lib` 命令即可得到如下的构建结果。

```bash
.
├── dist                            # umd 规范
│   ├── index.css
│   ├── index.css.map
│   ├── index.js
│   └── index.js.map
├── es                              # ES Module 规范
│   ├── function
│   │   ├── index.d.ts
│   │   └── index.js
│   ├── index.d.ts
│   ├── index.js
│   ├── react-components
│   │   └── Button
│   │       ├── index.d.ts
│   │       ├── index.js
│   │       └── style
│   │           ├── css.js
│   │           ├── index.css
│   │           ├── index.d.ts
│   │           ├── index.js
│   │           └── index.less
│   ├── style.d.ts
│   ├── style.js
│   └── vue-components
│       ├── Button
│       │   ├── button.js
│       │   ├── index.d.ts
│       │   ├── index.js
│       │   └── style
│       │       ├── css.js
│       │       ├── index.css
│       │       ├── index.d.ts
│       │       ├── index.js
│       │       └── index.less
│       ├── Toast
│       │   ├── SubVue.js
│       │   ├── Toast.js
│       │   ├── index.d.ts
│       │   └── index.js
│       └── mixins
│           ├── base.d.ts
│           └── base.js
└── lib                              # commonjs 规范
    ├── function
    │   ├── index.d.ts
    │   └── index.js
    ├── index.d.ts
    ├── index.js
    ├── react-components
    │   └── Button
    │       ├── index.d.ts
    │       ├── index.js
    │       └── style
    │           ├── css.js
    │           ├── index.css
    │           ├── index.d.ts
    │           ├── index.js
    │           └── index.less
    ├── style.d.ts
    ├── style.js
    └── vue-components
        ├── Button
        │   ├── button.js
        │   ├── index.d.ts
        │   ├── index.js
        │   └── style
        │       ├── css.js
        │       ├── index.css
        │       ├── index.d.ts
        │       ├── index.js
        │       └── index.less
        ├── Toast
        │   ├── SubVue.js
        │   ├── Toast.js
        │   ├── index.d.ts
        │   └── index.js
        └── mixins
            ├── base.d.ts
            └── base.js
```

# 开源项目

遇到问题，当然少不了参考开源项目的做法，下面拉了两个简单介绍一下。

## vant

vant：<https://github.com/youzan/vant/>

vant 没有使用 vue 文件，使用 tsx 作为源码文件（在 vue 中使用 jsx 语法），通过 babel 来对每个源文件进行编译。

构建文件参考：[地址](https://github.com/youzan/vant/blob/abbee1062b587e5d4360bad4f362a33e8e793398/build/build-components.js)。

vant 的构建结果目录参考：[地址](https://www.jsdelivr.com/package/npm/vant?version=2.2.15)。

## element

element：<https://github.com/ElemeFE/element>

element 选择 webpack 作为编译工具，把每个组件作为 webpack 的入口，最终打包出多个结果文件。

构建文件参考：[地址](https://github.com/ElemeFE/element/blob/6ec5f8e900ff698cf30e9479d692784af836a108/build/webpack.component.js#L10)

element 的构建结果目录参考：[地址](https://www.jsdelivr.com/package/npm/element-ui?version=2.13.0)。

# 结语

此外，还可以选择 rollup 作为构建的工具。总而言之，爱生活、爱折腾，多一种方式、多一种选择。
