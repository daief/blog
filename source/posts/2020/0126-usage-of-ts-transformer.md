---
title: TS transformer 的使用
date: 2020-01-26 13:07:08
id: usage-of-ts-transformer
categories: ['前端', 'TypeScript']
tags:
  - TypeScript
keywords:
  - TypeScript
  - custom transformer
  - before, after, afterDeclarations
description:
---

`TS transformer` 简单来讲就像[babel 插件](https://babeljs.io/docs/en/plugins/)一样，只不过作用于 TypeScript 的编译过程。

与 babel 插件不同的是，配置 transformer 的时候会有 `before`、`after`、`afterDeclarations` 这三种选项，如果不清楚他们之前的区别的话，使用的时候会充满困惑。

本文只关注 transformer 的使用，对应的 demo 仓库：<https://github.com/daief/usage-of-ts-transformer>。

<!-- more -->

# 配置 transformer

想要使用 transformer 有多种方式，常见的有：

- 配合 [ts-loader](https://github.com/TypeStrong/ts-loader#getcustomtransformers)
- 配合 [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader#getcustomtransformers-string--program-tsprogram--tscustomtransformers--undefined-defaultundefined)
- 配合 [gulp-typescript](https://github.com/ivogabe/gulp-typescript#custom-transforms)

而这里只是作为简单演示，则是直接使用了 [typescript](https://www.npmjs.com/package/typescript)：

```ts
// index.ts
import * as ts from 'typescript';

/**
 * 自定义 transformer
 */
const RenameTransformerFactory: ts.TransformerFactory<ts.SourceFile> = context => {
  // ...... 暂时省略
};

// Create the TS program.
const program = ts.createProgram(['src/index.ts'], {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  declaration: true,
  outDir: 'lib',
});

// emit compile
const emitResult = program.emit(undefined, undefined, undefined, undefined, {
  before: [RenameTransformerFactory], // 使用 transformer
  after: [],
  afterDeclarations: [],
});
```

# 使用时机

在上述代码片段中可以看到，将 transformer 传入到了 `before`，同时还有 `after` 和 `afterDeclarations` 可供选择，而三者的区别参阅的资料如下：

> TS itself comes with [a lot of ESNext -> ES5](https://github.com/Microsoft/TypeScript/tree/master/src/compiler/transformers) transformers by default. The pipeline allows you to order your custom transformer in a specific way:
>
> 1. `before` means your transformers get run before TS ones, which means your transformer will get raw TS syntax instead of transpiled syntax (e.g `import` instead of `require` or `define`)
> 2. `after` means your transformers get run after TS ones, which gets transpiled syntax.
> 3. `afterDeclarations` means your transformers get run during `d.ts` generation phase, allowing you to transform output type declarations.

我个人基于此的理解是这样的：

TS 自身具有强大的编译功能，如将 `ESNext` 语法降级、`ESModule` 语法转换为 `CommonJS` 规范。

假设有这样的一个转换场景：源码使用的是 `ESModule` 规范，`tsconfig` 中指定了 `module` 为 `commonjs`。

- `before`：指定在此阶段的 transformer，运行于 TS 自身的编译功能之前。transformer 基于的是最初输入的抽象语法树（AST），也就是说此时可以在 AST 找到 `import` 等与 `ESModule` 相关的节点。
- `after`：此阶段的 transformer 运行于 TS 编译之后，因为上面指定了输出为 `commonjs` 规范，同时代表此处的 transformer 已经读取不到 `ESModule` 相关的节点了，只能获取到 `require` 等信息。
- `afterDeclarations`：则是作用于 `d.ts` 类型文件生成的阶段，只影响类型文件的生成。

文字的描述显得苍白、费解，接着会分别看一下实际效果来帮助理解，但在那之前先简单介绍一下演示中的 transformer：

```ts
/**
 * 定义一个简单的 transformer，作用是：
 *  - before/afterDeclarations：将 import 语句中的模块名改成 `renamed-lib-name`
 *  - after：将 `"use strict";` 语句改为 `"use strict"; // use strict`
 */
const RenameTransformerFactory: ts.TransformerFactory<ts.SourceFile> = context => {
  return node => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (
        node.parent &&
        ts.isImportDeclaration(node.parent) &&
        node.parent.moduleSpecifier === node
      ) {
        // 更新 import
        return ts.createStringLiteral('renamed-lib-name');
      } else if (
        ts.isExpressionStatement(node) &&
        ts.isStringLiteral(node.expression) &&
        node.expression.text === 'use strict'
      ) {
        // 添加注释
        return ts.createIdentifier('"use strict"; // use strict');
      }
      return ts.visitEachChild(node, visitor, context);
    };
    return ts.visitNode(node, visitor);
  };
};
```

作为输入的源文件内容如下，`src/index.ts`：

```ts
// @ts-ignore
import value from 'some-lib';

export default value;
```

## before

只在 before 中使用，按照如下更改代码：

```ts
// emit compile
const emitResult = program.emit(undefined, undefined, undefined, undefined, {
  before: [RenameTransformerFactory],
  // after: [RenameTransformerFactory],
  // afterDeclarations: [RenameTransformerFactory]
});
```

然后运行编译（运行 `yarn compile`），查看 `lib` 下的结果文件。

`lib/index.js`：

```js
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// @ts-ignore
var some_lib_1 = require('renamed-lib-name');
exports.default = some_lib_1.default;
```

`lib/index.d.ts`：

```ts
import value from 'some-lib';
export default value;
```

**可以看到，transformer 生效将 `some-lib` 改成了 `renamed-lib-name`；但是输出的类型文件中依旧是 `import value from 'some-lib'`**。

## after

更新代码如下并编译：

```ts
const emitResult = program.emit(undefined, undefined, undefined, undefined, {
  // before: [RenameTransformerFactory],
  after: [RenameTransformerFactory],
  // afterDeclarations: [RenameTransformerFactory]
});
```

查看结果。

`lib/index.js`：

```js
'use strict'; // use strict
Object.defineProperty(exports, '__esModule', { value: true });
// @ts-ignore
var some_lib_1 = require('some-lib');
exports.default = some_lib_1.default;
```

`lib/index.d.ts`：

```ts
import value from 'some-lib';
export default value;
```

**这一次发现，注释成功添加上了，但是 `some-lib` 没有发生变化，类型文件也毫无变化。**

如前文所述，此时将插件作用到了 `after`，此时已经经过了 TS 自身的转换，已经转换成 `commonjs` 模块了，而更新 `some-lib` 是基于查找 `ImportDeclaration` 类型的节点的，此时自然就找不到、也做不了修改了；同时经过 TS 自身编译后的会在文件头部添加 `use strict`，因此 transformer 中第二个判断逻辑得以找到符合要求的节点并添加了注释。

## afterDeclarations

同样，更新代码使得插件作用于 `afterDeclarations`，并查看结果：

```ts
const emitResult = program.emit(undefined, undefined, undefined, undefined, {
  // before: [RenameTransformerFactory],
  // after: [RenameTransformerFactory]
  afterDeclarations: [RenameTransformerFactory],
});
```

`lib/index.js`：

```js
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// @ts-ignore
var some_lib_1 = require('some-lib');
exports.default = some_lib_1.default;
```

`lib/index.d.ts`：

```ts
import value from 'renamed-lib-name';
export default value;
```

**可以看到只有 `d.ts` 类型文件中体现了 transformer 的修改。所以，当需要通过 AST 干涉类型文件的生成时，就要在 afterDeclarations 中指定 transformer。**

# 结语

至此，对 TS transformer 的使用总算有了一个大体的认识。忍不住想吐槽一下，TS 的 transformer 在使用上相比 babel 插件要麻烦好多啊~

另外，`afterDeclarations` 是在这一次的学习中意外发现的，了解到 transformer 干涉类型文件的正确姿势。

实际上之前查阅过多次 transformer 修改类型文件输出的内容，但总是无果（感觉资料也少、又英文居多 😅...）。

all in all，这次学习了新知识的同时还解开了一个一直以来的小心结，内心十分舒坦。

最后，今天是新年初二，祝您新年快乐，鼠年大吉，平平安安，快快乐乐，万事如意~

也希望能早日战胜疫情，武汉加油！中国加油！

---

参考资料 & 相关阅读

- [Writing TypeScript custom AST Transformer (Part 1)](https://levelup.gitconnected.com/writing-typescript-custom-ast-transformer-part-1-7585d6916819)
- [custom transformer in afterDeclarations cannot transform declaration files](https://github.com/Microsoft/TypeScript/issues/29543)
