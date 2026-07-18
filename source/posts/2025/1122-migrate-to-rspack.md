---
title: 从 Webpack 迁移到 Rspack 的实践记录
id: migrate-to-rspack
date: 2025-11-22 21:58:16
tags:
  - Rspack
description: 记录将 Webpack 4/5 项目迁移至 Rspack 的实践，包括构建性能改善、兼容性评估与 SWC/Babel 生态问题处理。
draft: false
---

过去一段时间给一些前端项目做了改造，把构建器从 Webpack4/5 迁移到了 [Rspack](https://rspack.rs/)，大部分项目迁移完后，都减少了 **50%** 以上的构建时间，整体改善还是可观的。

选择 Rspack 另一方面的原因是它和 Webpack 兼容性较好，迁移成本相对较低，目前是一个非常推荐去尝试的构建器。笔者作为基建方，需要尽可能在底层做到最大的兼容，实际迁移过程中还是不可避免地遇到了一些问题，本文进行一个记录和分享。

<!-- more -->

## Babel 迁移到 SWC

Rspack 内置了 [SWC](https://swc.rs/) 作为默认的 JS/TS 转译器，理想状态下应该要直接替换掉 Babel，这是对构建速度影响最大的环节之一。

而能否顺利地完全迁移到 SWC，实际上取决于 SWC 的生态给不给力。不幸的是，当前生态还不够完善、不能直接让我完全从 Babel 转向 SWC。下面分享几个（类）我对 Babel 插件的处理。

### [babel-plugin-react-css-modules](https://www.npmjs.com/package/babel-plugin-react-css-modules)

目前 SWC 生态中并没有对应的插件，这驱动了我自己去用 Rust 复刻了一个 SWC 版本的插件，也是我在迁移中比较有技术挑战的一个点。具体的插件实现后续会单独写一篇文章来介绍，之后同时也打算整理一个开源版本。

### [babel-plugin-jsx-control-statements](https://www.npmjs.com/package/babel-plugin-jsx-control-statements)

可以使用 SWC 版本的 [swc-plugin-jsx-control-statements](https://github.com/intpp/swc-plugin-jsx-control-statements)，**但是**，Rspack 中会有一种避免作用域冲突的机制，会自动对变量进行重命名，导致这个 SWC 插件的 `For` 标签在 Rspack 中表现异常，具体如下：

```jsx
// input.js
<For each="item" index="i" of={list}>
  <div>{item.xxx}</div>
</For>;

// output.js
list.map(function (item1 /* ❌ 这里期望的 item 被重命名成了 item1 */) {
  return item.xxx; // 导致这里出现 Cannot read properties of undefined (reading xxx)
});
```

目前打了一个补丁来解决，但未能覆盖所有场景，详见 [PR#9](https://github.com/intpp/swc-plugin-jsx-control-statements/pull/9)。在原作者未接受前，我发布了一个临时版本的包 [@axew/swc-plugin-jsx-control-statements](https://www.npmjs.com/package/@axew/swc-plugin-jsx-control-statements)。

### proposal 系列插件

比如 `@babel/plugin-proposal-object-rest-spread`，这部分比较好处理，我的选择是舍弃，毕竟大部分已经是语言标准了，直接依托 SWC 所覆盖到的语法即可。不建议去使用太新、不稳定的语法特性。

## TypeScript 迁移

对于 TS 的迁移，有一些不兼容的点需要格外关注，官方文档中也有明确提出：[Migrating from tsc](https://swc.rs/docs/migrating-from-tsc)。

本质上是因为 SWC 在某种程度上类似 [babel-plugin-transform-typescript](https://babeljs.io/docs/babel-plugin-transform-typescript)，都是单文件转换（File-by-File Transformation）、无法处理任何需要理解完整类型系统的代码转换。

因此，如果迁移前是使用 `ts-loader` 这种基于 `tsc` 完成编译的项目，更需要关注迁移手册中的注意点。在这种情况下 SWC 编译不会报错，只会编译出不同的产物、可能的错误问题只会在运行时才暴露。

下面描述两个具体的案例来辅助说明。

### 类属性定义的场景

对类、继承和装饰器涉及的项目，建议根据原始 [TS 配置中的行为](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields)明确指定 `useDefineForClassFields` 的值，确保迁移后的行为与迁移前一致。比如有下面这样的继承案例：

`source.ts`：

```ts
class A {
  prop = 1;
}

class B extends A {
  prop: number;
}

new B().prop;
```

`TypeScript` 结果（target: ES2015）：

```js
'use strict';
class A {
  constructor() {
    this.prop = 1;
  }
}
class B extends A {
  // 注意这里 B 中的 prop 定义只有类型，整个会被擦除
}
new B().prop; // 所以这里结果会是 1
```

`SWC` 结果：

```json
// .swcrc
{
  "jsc": {
    "parser": {
      "syntax": "typescript"
    },
    "target": "es2015",
    "loose": false // loose 对编译结果也会有影响
  }
}
```

```js
import { _ as r } from '@swc/helpers/_/_define_property';

class A {
  constructor() {
    r(this, 'prop', 1);
  }
}

class B extends A {
  constructor(...s) {
    super(...s), r(this, 'prop', void 0); // 💥 这里 B 中会真实定义出 prop 并赋值 undefined
  }
}
new B().prop; // 所以这里结果会是 undefined
```

### 依赖全局类型系统的场景

在我遇到的某些项目中，重度依赖了装饰器和装饰器元数据，那么实际上 SWC 就无法处理了，只能依旧保留 ts-loader：

```js
// rspack.config.js
module.exports = {
  module: {
    rules: [
      {
        loader: 'builtin:swc-loader',
        options: {
          /* ...swc options */
        },
      },
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          happyPackMode: true,
        },
      },
    ],
  },
};
```

像这样继续使用 ts-loader，对构建性能的影响就会比较大，最终的提升效果会变小。不过好消息是 [TypeScript 7](https://github.com/microsoft/typescript-go) 正如火如荼地进行中，未来可以迁移到 go 版本的 TS 来获得性能提升。

SWC 无法处理的一个具体场景如下：

```ts
// enum.ts
export enum TestEnum {
  a = 'a',
  b = 'b',
}

// index.ts
import { TestEnum } from './enum';

const decorator: any = () => {};

class TestClass {
  @decorator
  prop?: TestEnum;
}
```

ts-loader 的结果：

```js
var TestClass = /** @class */ (function () {
  function TestClass() {}
  __decorate(
    // ⚠️ 这里 TypeScrip 直接基于枚举定义推导出是 String
    [decorator, __metadata('design:type', String)],
    TestClass.prototype,
    'prop',
  );
  return TestClass;
})();
```

SWC 的结果：

```js
var TestClass = function TestClass() {
  'use strict';
  _class_call_check(this, TestClass);
};
_ts_decorate(
  [
    decorator,
    _ts_metadata(
      'design:type',
      // ⚠️ SWC 在这里的运行时结果是 TestEnum 对象本身
      typeof _enum__WEBPACK_IMPORTED_MODULE_0__.TestEnum === 'undefined'
        ? Object
        : _enum__WEBPACK_IMPORTED_MODULE_0__.TestEnum,
    ),
  ],
  TestClass.prototype,
  'prop',
  void 0,
);
```

## worker-loader

worker 本身没有什么问题，Rspack 官方也有对 [worker-loader](https://rspack.rs/zh/guide/features/web-workers#worker-loader) 处理的说明。但我单独提出这点的原因是，我需要兼容业务方的代码，让业务方做到无感迁移，这在迁移中给我造成了不少的麻烦。

大部分业务方对 worker 使用内联写法，这样的好处是业务方的上层应用无需关注底层 worker 的实现细节：

```js
// 注意这里的参数，都是 `worker-loader@v2` 的格式
const Worker = require('worker-loader?inline=true&fallback=false!./worker.js');
```

但这种内联参数导致无法直接使用官方基于 `worker-loader@v3` 实现的 [worker-rspack-loader](https://github.com/rspack-contrib/worker-rspack-loader)。此外，`worker-loader@v3` 与 `v2` 在打包行为上也有差异：

```js
// rspack.config.js
module.exports = {
  externals: {
    lodash: '_',
  },
};

// work.js
import lodash from 'lodash';
```

- `v2`：打包出来的 worker.js，不会遵循 externals，对于上述例子中的 lodash 会打包进 worker.js 中
- `v3`：打包结果会遵循 externals，worker.js 中不会包含 lodash 的内容，而是直接引用全局变量 `_`，导致运行时错误

由于 worker-rspack-loader 的内在限制，我 fork 了 worker-rspack-loader，实现了一个自定义的 custom-worker-rspack-loader，在自定义的 loader 中：

1. 我对 loader 的参数加了一层 v2、v3 的兼容，实现针对 v2 参数格式的兼容，位置在 [src/index.js#L19](https://github.com/rspack-contrib/worker-rspack-loader/blob/124098b9c6ca3467cdbdc675ea095fbfb3a11f1c/src/index.js#L19)
2. 增加了自定义参数 `disableExternals`，可以控制禁用默认的 external 行为，让打包行为和 v2 一样不排除依赖，位置在 [src/index.js#L76](https://github.com/rspack-contrib/worker-rspack-loader/blob/124098b9c6ca3467cdbdc675ea095fbfb3a11f1c/src/index.js#L76)

最后借助 `resolveLoader` 实现 loader 替换，实现了业务方无感迁移：

```js
// rspack.config.cjs
module.exports = {
  resolveLoader: {
    alias: {
      'worker-loader': require.resolve('custom-worker-rspack-loader'),
    },
  },
};
```

## 模块规范问题

历史原因导致前端环境下的模块使用方式会有很多，迁移到 Rspack 之后，有些不规范的写法会导致错误。

比如会有这样的混用：

```json
// node_modules/pkg-a/package.json
{
  "name": "pkg-a",
  "version": "1.0.0",
  "main": "index.js",
  "exports": {
    "./sub": "./sub.js"
  }
}
```

`import pkgA from 'pkg-a'` 会出现 `Package subpath '.' is not defined by "exports"` 的错误，只需在 `exports` 中补充 `".": "./index.js"` 即可。

也有像这样 `pkg-b`（type: module）中引用 `pkg-c`（commonjs）导致的错误：

```json
// node_modules/pkg-b/package.json
{
  "name": "pkg-b",
  "type": "module"
}
```

```js
// node_modules/pkg-b/index.js
import c from 'pkg-c/a/b/c'; // pkg-c 中没有使用 exports 定义
```

此时会出现 `Module not found` 的错误：

```bash
ERROR in ./node_modules/pkg-b/index.js 1:0-27
  × Module not found: Can't resolve 'pkg-c/a/b/c' in '...'
   ╭─[1:0]
 1 │ import pa from 'pkg-c/a/b/c';
   · ───────────────────────────
 2 │ export var a = 1;
 3 │ export var b = 2;
   ╰────
  help: Did you mean '.../node_modules/pkg-c/a/b/c.js'?

        The request 'pkg-c/a/b/c' failed to resolve only because it was resolved as fully specified,
        probably because the origin is strict EcmaScript Module,
        e. g. a module with javascript mimetype, a '*.mjs' file, or a '*.js' file where the package.json contains '"type": "module"'.

        The extension in the request is mandatory for it to be fully specified.
        Add the extension to the request.
```

解法有多种：

- 删除 `pkg-b/package.json` 中的 `type: module`，只使用 `module: index.js` 即可
- 或者显式添加 `.js` 后缀 `import c from 'pkg-c/a/b/c.js'`，不建议使用这种方式，对依赖有要求

## 小结

在踩过这些坑后，之后的项目再从 Webpack 迁移到 Rspack 就变得简单了，敲个迁移命令、检查下打包配置，基本上在分钟级就能完成，对业务而言能以极低的迁移成本换取客观的性能改善。
