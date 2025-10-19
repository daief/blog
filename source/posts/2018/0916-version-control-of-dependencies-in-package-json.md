---
title: package.json 中依赖包的版本控制
date: 2018-09-16 16:51:33
id: version-control-of-dependencies-in-package-json
categories: ['Node.js', 'npm']
tags:
  - npm
  - package.json
  - 语义化版本
keywords:
description:
---

在`package.json`中对依赖包的版本使用`^`、`~`等时需要注意的地方。
[package.json 详细说明](https://docs.npmjs.com/files/package.json)

<!-- more -->

# 语义化版本

`npm`遵循[语义化版本 2.0.0 ](https://semver.org/lang/zh-CN/)的规范。

> 版本格式：主版本号.次版本号.修订号，版本号递增规则如下：
>
> 主版本号：当你做了不兼容的 API 修改，
> 次版本号：当你做了向下兼容的功能性新增，
> 修订号：当你做了向下兼容的问题修正。
>
> 先行版本号及版本编译信息可以加到“主版本号.次版本号.修订号”的后面，作为延伸。

# package.json 中的 dependencies

## 版本冲突、重复打包的现象

有如下情况，发生了版本冲突的情况：

```js
// app/package.json
{
  "name": "app",
  "version": "1.0.0",
  "dependencies": {
    "classnames": "^2.0.0",
    "test-pkg": "^1.0.0"
  }
}

// test-pkg/package.json
{
  "name": "test-pkg",
  "version": "1.0.0",
  "dependencies": {
    "classnames": "^1"
  }
}
```

在执行`npm install`之后的目录结构：

```bash
# app/node_modules
node_modules/
|
|---test-pkg
|   |-- classnames@^1.0.0
|
|---classnames@^2.0.0

```

两部分的`index.js`：

```js
// test-pkg
// index.js
import classnames from 'classnames' // version 1.2.2
export function() {
  console.log('1.2.2', classnames)
}

// app
// index.js
import test from 'test-pkg'
import classnames from 'classnames' // version > 2
test()
console.log('new', classnames)
```

当使用`webpack@^3.3.0`对`app`进行打包，可以看到两种版本的依赖都被打包了进来：

```js
// bundle.js, webpack@^3.3.0
/******/ (function(modules) { // webpackBootstrap
// ...
/************************************************************************/
/******/ ([

/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_test_pkg__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_classnames__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_classnames___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_classnames__);

Object(__WEBPACK_IMPORTED_MODULE_0_test_pkg__["a" /* default */])()
console.log('new', __WEBPACK_IMPORTED_MODULE_1_classnames___default.a)
/***/ }),

/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_classnames__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_classnames___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_classnames__);


/* harmony default export */ __webpack_exports__["a"] = (function() {
  console.log('1.2.2', __WEBPACK_IMPORTED_MODULE_0_classnames___default.a)
});


/***/ }),

/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames() {
	// ...
}
// ...
/***/ }),

/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		// ...
	}

	// ...
}());
/***/ })

/******/ ]);
```

但版本冲突且两者不兼容的情况下，`bundle.js`将两者都包含，这是无可非议的。但是如果因为写法上的失误，造成的冲突发生于`1.2.0`和`1.2.3`之间，最终在打包时也将两者都包含了，那么显然是冗余了，这是不应该的。

## 依赖升级的现象

如果指定了可变版本，当[ lock 文件](https://docs.npmjs.com/files/package-lock.json)丢失或是需要主动去升级依赖而重新安装依赖时，可能会下载到新版本的依赖。新包可能会有破坏性变动，使得项目跑不起来，这时候就会带给我们新的麻烦。

## 如何使用

目前为止还没太多经验，只有些简单的看法：

1. 没有什么特殊情况的依赖可以把版本号锁死或是使用`~`允许修订号升级；
2. 不少第三方 npm 模块的依赖里都有用上`^`、`~`，往往在我们锁死版本号的情况下也能获得兼容，不会发生版本冲突的问题；
3. 理论上来讲，在符合`语义化版本`的规范下，使用`^`、`~`是不会有因为依赖升级而`broken`的现象，但现实总是多变的，锁死版本号比可变版本产生问题的概率可能要小些。
4. 需要主动升级第三方依赖的时候：可变版本号升级比较方便；锁死版本的情况需要手动升级，会显得比较繁琐。

---

文中不妥之处，欢迎指出、补充，感谢阅读。
