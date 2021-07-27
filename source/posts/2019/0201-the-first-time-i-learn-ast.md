---
title: 初识 AST
date: 2019-02-01 15:58:47
id: the-first-time-i-learn-ast
categories: ["前端"]
tags:
  - JavaScript
  - TypeScript
  - AST
keywords:
  - JavaScript
  - TypeScript
  - AST
  - babel
  - compiler
  - react-hot-loader
  - rhl
  - transformer
---

> 在计算机科学中，抽象语法树（Abstract Syntax Tree，AST），或简称语法树（Syntax tree），是源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。

Babel、UglifyJS2、ESLint、Webpack、TypeScript 等我们熟知的工具都包含 AST 的应用，实现了强大的功能。本文主要记录学习、应用 AST 的过程，主要内容：1. 解读 [react-hot-loader dev 环境下的 Babel 插件](https://github.com/gaearon/react-hot-loader/blob/master/src/babel.dev.js)；2. 编写对应的 TypeScript transformer 尽可能实现相同的功能。

<!-- more -->

[react-hot-loader/babel 是一个 Babel 插件](https://github.com/gaearon/react-hot-loader#getting-started)，用于帮助 RHL（reac-hot-loader）更好地工作。对于 TS 用户，官方的建议是使用 Babel 来进行 TS 的编译以发挥插件作用。但这可能会使 TS 用户感到困扰，因此尝试编写相应的 TS transformer 来实现相同的功能。

## AST

顾名思义，AST 是一棵树，由一个个节点（Node）组成，每个节点拥有 Type 标识以表示各自的类型。

Babel、TypeScript 的运行会经历以下流程（极简概括）：code ~> AST ~> code；同时他们开放了对应的 API 允许我们去操纵 AST，最终输出我们期望的结果。

因为 AST 的节点类型很多，想要全部记住是十分困难的，推荐使用 [AST explorer](https://astexplorer.net/) 实时地查看，注意选择语言和相应的 parser。

简单来说，操作 AST 的过程就是遍历 AST，当发现符合条件的节点时进行编辑，最终返回一棵新的 AST。

## react-hot-loader/babel

### 作用

让我们先简要了解该插件实际的表现：

- 将默认导出声明 => 默认导出语句
- 在每个文件模块顶部、底部插入内容
- 在符合条件的类声明中插入名为 \_\_reactstandin\_\_regenerateByEval 的自定义方法

具体例子，原代码内容：
```js
import P, { Q } from "left-pad";
const A = 42;
function B() {
  function R() {}
  class S {}
  const T = 42;
}
export class C {
  U() {
    function V() {
      class W {}
    }
  }
}
const D = class X {};
let E = D;
var Y = require("left-pad");
var { Z } = require("left-pad");
export default React.createClass({});
```

经过转换的代码，该结果还包含降级为 ES5 的内容，注意区分：
```js
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.C = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _leftPad = require("left-pad");

var _leftPad2 = _interopRequireDefault(_leftPad);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* ---------- 顶部内容 */
(function () {
  var enterModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).enterModule;
  enterModule && enterModule(module);
})();
/* ---------- 顶部内容 end */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var A = 42;
function B() {
  function R() {}

  var S = function S() {
    _classCallCheck(this, S);
  };

  var T = 42;
}

var C = exports.C = function () {
  function C() {
    _classCallCheck(this, C);
  }

  _createClass(C, [{
    key: "U",
    value: function U() {
      function V() {
        var W = function W() {
          _classCallCheck(this, W);
        };
      }
    }
  }, {
    key: "__reactstandin__regenerateByEval",
    // @ts-ignore
    value: function __reactstandin__regenerateByEval(key, code) {
      // @ts-ignore
      this[key] = eval(code);
    }
  }]);

  return C;
}();

var D = function X() {
  _classCallCheck(this, X);
};
var E = D;
var Y = require("left-pad");

var _require = require("left-pad"),
    Z = _require.Z;

var _default = React.createClass({
  displayName: "_default"
});

exports.default = _default;
;

/* ---------- 底部内容 */
(function () {
  var reactHotLoader = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).default;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(A, "A", __FILENAME__);
  reactHotLoader.register(B, "B", __FILENAME__);
  reactHotLoader.register(C, "C", __FILENAME__);
  reactHotLoader.register(D, "D", __FILENAME__);
  reactHotLoader.register(E, "E", __FILENAME__);
  reactHotLoader.register(_default, "default", __FILENAME__);
})();

;

(function () {
  var leaveModule = (typeof reactHotLoaderGlobal !== 'undefined' ? reactHotLoaderGlobal : require('react-hot-loader')).leaveModule;
  leaveModule && leaveModule(module);
})();
/* ---------- 底部内容 end */
```

### 实现

源码：https://github.com/gaearon/react-hot-loader/blob/master/src/babel.dev.js。

可以看到插件实际上是一个方法，形如：

```js
module.exports = function plugin(args, options = {}) {
  const { types, template } = args;
  // ...
  return {
    visitor: {
      ExportDefaultDeclaration(path, state) {
        // ...
      },
      Program: {
        enter({ scope }, state) {
          // ...
        },
        exit({ node }, state) {
          // ...
        },
      },
      Class(path) {
        // ...
      },
    },
  }
}
```

插件方法返回了一个对象，包含一个 visitor 对象，而 visitor 对象中又定义了 ExportDefaultDeclaration、Program 和 Class 的内容。这是一个用于遍历 AST 的访问者模式，当这样定义后，每当遍历到 ExportDefaultDeclaration 节点，就会调用相应的 ExportDefaultDeclaration 方法；而对于树节点的访问，会在进入、离开共发生两次，默认在进入节点时调用，也可以通过 enter、exit 进行指定调用时机，其他定义的节点同理。

插件的第一个参数中可以拿到 `types`、`template` 两个对象，分别对应 [@babel/types](https://babeljs.io/docs/en/babel-types)、[@babel/template](https://babeljs.io/docs/en/babel-template)。这是两个十分有用的对象，详情可参照链接及插件源码，以下作简单说明：

> @babel/types
> 是一个用于 AST 节点的工具库，包含了构造、验证以及变换 AST 节点的方法。该工具库包含考虑周到的工具方法，对编写处理AST逻辑非常有用。

> @babel/template
> 让编写字符串形式且带有占位符的代码来代替手动编码，尤其是生成的大规模 AST 的时候。在计算机科学中，这种能力被称为准引用（quasiquotes）。

visitor 中的每个函数接收 `path` 和 `state` 两个参数。

> path
> 表示两个节点之间的连接，通过这个对象我们可以访问到节点、父节点以及进行一系列跟节点操作相关的方法（类似 DOM 的操作）。

关于 state，没能找到比较好的概念说明，目前为止只了解到一些相关的作用：1. 在 state 中可以拿到插件接收的 options；2. 可以通过 state 对象在不同 visitor 函数中进行数据传递。

最后来看看 Class 节点遍历中做了什么：

> Class 类型是别名，包括 classDeclaration、classExpression。

```js
// 以下的 t 即上文提及的 @babel/types
{
  Class(classPath) {
    // 拿到 class 声明的 body
    const classBody = classPath.get('body')

    // 以下两个变量用于后面判断该 class 节点是否需要注入方法
    let hasRegenerateMethod = false
    let hasMethods = false

    // 遍历 classBody 判断注入的必要性
    classBody.get('body').forEach(path => {
      const { node } = path

      if (node.static) {
        return
      }

      if (node.key.name !== REGENERATE_METHOD) {
        hasMethods = true
      } else {
        hasRegenerateMethod = true
      }
    })

    // 符合条件时，注入方法
    if (hasMethods && !hasRegenerateMethod) {
      // 创建一个类方法
      const regenerateMethod = t.classMethod(
        'method',
        t.identifier(REGENERATE_METHOD),
        [t.identifier('key'), t.identifier('code')],
        t.blockStatement([
          // 将字符串代码转换为 AST
          template('this[key]=eval(code);', templateOptions)()
        ]),
      )

      // 将新建的类方法插入 classBody
      classBody.pushContainer('body', regenerateMethod)

      // 最后在插入的方法内外添加两条注释
      classBody.get('body').forEach(path => {
        const { node } = path

        if (node.key.name === REGENERATE_METHOD) {
          path.addComment('leading', ' @ts-ignore', true)
          path
            .get('body')
            .get('body')[0]
            .addComment('leading', ' @ts-ignore', true)
        }
      })
    }
  },
}
```

## ts-rhl-transformer

TypeScript 在编译时也会产生一棵 AST，我们同样可以借助相应的 API 去操作这棵树，以实现期望的效果。编写 TS 的 transformer 与 Babel 插件有不少相同的地方，同样通过 visitor 对象去遍历节点。需要注意的是，两者在书写方式和节点类型上有许多不同。这里介绍的 TS transformer 是基于 Webpack 环境下运行的，使用方法可参照 [typescript-plugin-styled-components](https://github.com/Igorbek/typescript-plugin-styled-components#integration-with-webpack)。

首先来看 transformer 的整体情况：

```ts
import * as ts from 'typescript';

// 插件也是一个方法，该方法返回一个 transformer 对象
export default function createTransformer() {

  // transformer 对象
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return transformerNode => {

      // 自定义 visitor
      const visitorClassLike: ts.Visitor = node => {
        if (ts.isClassLike(node)) {
          // 当节点类型符合条件时执行逻辑

          // ...

          // 如果需要递归遍历，一定要返回 ts.visitEachChild
          return ts.visitEachChild(node, visitorClassLike, context);
        }
        return ts.visitEachChild(node, visitorClassLike, context);
      }; // ------- 自定义 visitor end

      // 这里的 transformerNode 又称之为 SourceFile，是根节点
      return ts.visitNode(transformerNode, visitorClassLike);
    }
  };

  return transformer;
}
```

在 TS transformer 的编写中，我们能用的 API 基本都在 ts 对象中。下面，来看看如何在此同样实现在类声明中插入自定义方法。

```ts
/**
 * 自定义 class visitor，用于访问 class 并注入自定义方法
 */
const visitorClassLike: ts.Visitor = node => {
  // isClassLike 类似于 babel 中的 class 别名，包括 ClassDeclaration、ClassExpression 两者情况
  // 此判断确保只对该类型节点进行操作
  if (ts.isClassLike(node)) {
    // 同样的两个用于判断的变量
    let hasRegenerateMethod = false;
    let hasMethods = false;

    /**
     * 遍历类成员进行判断
     */
    node.members.forEach(classEle => {
      let hasStatic = false;
      for (const ele of classEle.modifiers || []) {
        if (ele.kind === ts.SyntaxKind.StaticKeyword) {
          hasStatic = true;
          break;
        }
      }

      if (hasStatic) {
        return;
      }

      // notice node type check
      if (
        ts.isMethodDeclaration(classEle) ||
        ts.isPropertyDeclaration(classEle) ||
        ts.isConstructorDeclaration(classEle)
      ) {
        const propName = classEle.name ? classEle.name.getText() : 'constructor';
        hasMethods = propName !== REGENERATE_METHOD;
        hasRegenerateMethod = propName === REGENERATE_METHOD;
      }
    });

    if (hasMethods && !hasRegenerateMethod) {
      /**
       * 符合条件，新建类方法
       */
      const method = ts.createMethod(
        undefined,
        undefined,
        undefined,
        // method name
        REGENERATE_METHOD,
        undefined,
        undefined,
        // parameters -- 方法参数
        [
          ts.createParameter(undefined, undefined, undefined, 'key'),
          ts.createParameter(undefined, undefined, undefined, 'code'),
        ],
        undefined,
        // method body -- 方法体内容
        ts.createBlock([
          ts.createExpressionStatement(ts.createIdentifier('this[key] = eval(code)')),
        ])
      );

      // 通过 update 为前缀的方法更新节点，将当前 node 进行更新
      // 并进行递归访问
      // 因为实际上有两种类声明方式，这里做了下区分
      return ts.visitEachChild(
        ts.isClassDeclaration(node)
          ? ts.updateClassDeclaration(
              node,
              node.decorators,
              node.modifiers,
              node.name,
              node.typeParameters,
              node.heritageClauses,
              node.members.concat([method])
            )
          : ts.updateClassExpression(
              node,
              node.modifiers,
              node.name,
              node.typeParameters,
              node.heritageClauses,
              node.members.concat([method])
            ),
        visitorClassLike,
        context
      );
    }
  }

  return ts.visitEachChild(node, visitorClassLike, context);
};
```

`ts.createIdentifier` 可实现与 @babel/template 相似的功能，只是没那么强大，缺少占位符替换等功能。

[完整源码查看这里](https://github.com/daief/jugg/blob/master/packages/jugg-plugin-react/src/ts-rhl-transformer/ts-rhl-transformer.dev.ts)。编写过程中参照了不少大佬 [@Jetsly](https://github.com/Jetsly) 的实现，获得了不小的帮助，感谢大佬（[大佬的仓库](https://github.com/Jetsly/ts-react-hot-transformer)）。

本节最后来看看该插件实现的效果，前后代码转换对比（本过程不涉及 ES 降级）：

```ts
/* --------------- 原始代码 --------------- */
import P, { Q } from "left-pad";
const A = 42;
function B() {
  function R() {}
  class S {}
  const T = 42;
}
export class C {
  U() {
    function V() {
      class W {}
    }
  }
}
const D = class X {};
let E = D;
var Y = require("left-pad");
var { Z } = require("left-pad");
export default React.createClass({});


/* --------------- 转换结果 --------------- */
(function () {
  var enterModule = require('react-hot-loader').enterModule;
  enterModule && enterModule(module);
}())
;


;
import P, { Q } from "left-p";
const A = 42;
function B() {
    function R() { }
    class S {
    }
    const T = 42;
}
export class C {
    U() {
        function V() {
            class W {
            }
        }
    }
    __reactstandin__regenerateByEval(key, code) { this[key] = eval(code); }
}
const D = class X {
};
let E = D;
var Y = require("left-pad");
var { Z } = require("left-pad");
const _default_1 = React.createClass({})
export default _default_1;


;
(function () {
var reactHotLoader = require('react-hot-loader').default;
var leaveModule = require('react-hot-loader').leaveModule;
if (!reactHotLoader) {
  return;
}
; reactHotLoader.register(A, "A", "bindings.js");
; reactHotLoader.register(B, "B", "bindings.js");
; reactHotLoader.register(C, "C", "bindings.js");
; reactHotLoader.register(D, "D", "bindings.js");
; reactHotLoader.register(E, "E", "bindings.js");
; reactHotLoader.register(_default_1, "default", "bindings.js");
; leaveModule(module); }());
```

## 结语

修改 AST 的时候一定要十分小心，注意涉及范围的节点类型、作用域等内容，不要影响了无辜的代码。树的节点类型很多，极其建议在编写时结合 AST explorer 等可视化工具进行查看。

通过 AST 可以实现各种各样强大、有趣的功能，用来解决、优化日常的编程。

只要有想法，就能玩出花。

完。

---

参考链接 & 推荐阅读：

- [How to Write a TypeScript Transform (Plugin)](https://dev.doctorevidence.com/how-to-write-a-typescript-transform-plugin-fc5308fdd943)
- [AST explorer](https://astexplorer.net/)
- [手把手教写 TypeScript Transformer Plugin](https://juejin.im/post/5a0a54425188253edc7f6e79)
- [[TypeScript] Compiler API 第一次接觸](https://blog.kevinyang.net/2018/08/17/typescript-compiler/)
- [babel插件入门-AST（抽象语法树）](https://juejin.im/post/5ab9f2f3f265da239b4174f0)
- [Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)
- [TypeScript Language Specification](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md)
- [babel-parser ast spec](https://github.com/babel/babel/blob/master/packages/babel-parser/ast/spec.md)
- [AST in Modern JavaScript](https://zhuanlan.zhihu.com/p/32189701)
- [深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/)
- [Babel Doc](https://babeljs.io/docs/en/)
- [理解 Babel 插件](http://taobaofed.org/blog/2016/09/30/babel-plugins/)
- [typescript-plugin-styled-components](https://github.com/Igorbek/typescript-plugin-styled-components)
- [react-hot-loader@4.x/babel](https://github.com/gaearon/react-hot-loader/blob/master/src/babel.dev.js)
- [ts-react-hot-transformer](https://github.com/Jetsly/ts-react-hot-transformer)
- [@axew/jugg-plugin-react/lib/ts-rhl-transformer](https://github.com/daief/jugg/tree/master/packages/jugg-plugin-react/src/ts-rhl-transformer)
