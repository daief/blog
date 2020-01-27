---
title: TypeScript 中的声明文件
date: 2018-09-04 21:10:44
id: declaration-files-of-typescript
categories: ["前端", "TypeScript"]
tags:
  - TypeScript
  - declaration-files
keywords:
description:
---

学习 TypeScript 稍微有一段时间了，每次写都会碰到有关声明文件的问题，目前为止暂未完全搞清楚，在此记录一些相关问题，以后碰到能够迅速解决。

<!-- more -->

# 声明文件（x.d.ts）

> [TypeScript 作为 JavaScript 的超集，在开发过程中不可避免要引用其他第三方的 JavaScript 的库。虽然通过直接引用可以调用库的类和方法，但是却无法使用TypeScript 诸如类型检查等特性功能。为了解决这个问题，需要将这些库里的函数和方法体去掉后只保留导出类型声明，而产生了一个描述 JavaScript 库和模块信息的声明文件。通过引用这个声明文件，就可以借用 TypeScript 的各种特性来使用库文件了。](https://www.cnblogs.com/niklai/p/6095974.html)

在开始描述各种问题之前，列举一下我所知道的声明文件存放的方式（常规配置下）：

1. `src/@types/`，在 src 目录新建`@types`目录，在其中编写`.d.ts`声明文件，声明文件会自动被识别，可以在此为一些没有声明文件的模块编写自己的声明文件；
**2018-10-31**：实际上在 `tsconfig` `include` 字段包含的范围内编写 .d.ts，都将被自动识别。
2. 在`x.js`相同目录创建同名声明文件`x.d.ts`，这样也会被自动识别；
3. `node_modules/@types/`下存放各个第三方模块的声明文件，通过`yarn add @types/react`自动下载到此处，自己编写的声明文件不要放在这里；
4. 作为 npm 模块发布时，声明文件可捆绑发布，需在`package.json`中指明`"types": "./types/index.d.ts"`；
5. `typings 声明管理器`，了解不多，已经不推荐使用；

# 隐式 any 类型（implicitly has an 'any' type）

当 tsconfig.json 中关闭`"noImplicitAny": false`时，可以直接在 TypeScript 中引用 JavaScript（无声明文件）的库，所有的引入都会被默认为`any`类型。但为了规范编码，总是打开`"noImplicitAny": true`，这样当发生上述情况时，编译器会阻止编译，提示我们去加上类型规范。

## TS 中导入 JS

```js
// hello.js
export const hello = () => console.log('hello')

// index.ts
import {hello} from './hello'
// 如果使用 vscode，编辑器就会给出错误提示：
// [ts] 无法找到模块“./hello”的声明文件。“src/hello.js”隐式拥有 "any" 类型。
hello()

// 如果执行编译，控制台也会给出同样的错误提示：
// Could not find a declaration file for module './hello'. 'src/hello.js' implicitly has an 'any' type.
```

这就告诉我们，若要在`index.ts`中使用`hello.js`，需要先为`hello.js`编写声明文件。

> [关于 declare](https://stackoverflow.com/questions/35019987/what-does-declare-do-in-export-declare-class-actions)

```js
// hello.d.ts
// 描述 hello.js
export declare const hello: () => void

```

另一种书写方式，目前还没完全搞清两者本质区别：

```js
// hello.d.ts
export as namespace hello;

export = hello;

declare namespace hello {
  export const hello: () => void;
}
```

实际上，看了一些第三方模块的声明文件，形式也是五花八门，看得一头雾水，学得一头包……

## TS 中导入 .png、.json 等

不止是在 TypeScript 中导入未声明 JavaScript，导入`.png`、`.json`等文件时也同样需要去编写声明文件。

提供一种方式，可以创建一个声明文件`src/@types/definition.d.ts`（你也可以命名为其他），在其中编写如下声明：

```js
// definition.d.ts
declare module '*.png' {
  const value: string
  export = value
}

// index.ts
// 之后在 TS 中导入也不会有问题
import avatar from './img/avatar.png'

```

或者可以使用`require`：

```ts
const avatar = require('./img/avatar.png')
// 可能会提示 require 未定义，有两种方式：
//  1. 自行声明：declare const require: any
//  2. yarn add -D @types/node
```

## 第三方模块没有可用的声明文件

一般使用第三方不是 TypeScript 编写的模块时，我们可以直接下载对应的声明文件：`yarn add @types/{模块名}`。然而有些模块是没有对应的声明文件的，这时候就需要我们自己编写声明文件，以`rc-form`为例，只需在`src/@types/definition.d.ts`中添加对应代码即可：

```js
// definition.d.ts
declare module '*.png' {
  const value: string
  export = value
}

// 新增部分
declare module "rc-form" {
  // 在此只是简单地进行类型描述
  export const createForm: any;
  export const createFormField: any;
  export const formShape: any;
}
```

# webpack 别名（aliases）

当 webpack 中配置了别名，在 TS 中使用时会出现`找不到模块`：

```js
// webpack.config.js
const config = {
  // ...
  aliases: {
    // 公共的工具类、容器和组件
    utils: path.resolve('../utils'),
  },
  // ...
}

// index.ts
import {ua} from 'utils/broswer'
// Cannot find module 'utils/browser'
```

只需在 tsconfig.json 添加`baseUrl`和`paths`的配置即可：

```js
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "noImplicitAny": true,
    // 添加配置
    "baseUrl": ".",
    "paths": {
      "utils/*": ["../utils/*"],
      "components/*": ["../components/*"]
    }
  },
  "include": ["./src/*", "./src/**/*"],
  "exclude": ["node_modules"]
}
```

# 类型“Window”上不存在属性“X”

有时候，直接通过 script、src 引入的对象在 window.X 是可以直接访问的，但在 TS 中直接使用时会提示不存在相应属性（The property 'X' does not exist on value of type 'window'），这时候需要对 window 进行扩展，直接在`src/@types/definition.d.ts`中扩展。

```js
// definition.d.ts
interface Window {
  X: any
}

// index.ts
console.log(window.X) // success
```

我在使用时，想复用一些类型，从其他文件导入了一些内容，这时候出现了问题：

```js
// definition.d.ts
import {IPerson} from './interfaces/index.ts'

// ...

interface Window {
  X: any
}


// index.ts
console.log(window.X) // fail: 类型“Window”上不存在属性“X”
```

然后发现，套一层`global`又能恢复正常，但没有`import`语句时，使用`declare global`会提示错误：

```js
// definition.d.ts
import {IPerson} from './interfaces/index.ts'

// ...

// global 包裹
declare global {
  interface Window {
    X: any
  }
}


// index.ts
console.log(window.X) // success
```

---

未完，不定期补充。
如有错误，欢迎指出；若能给予几句指导，不胜感激。😀
