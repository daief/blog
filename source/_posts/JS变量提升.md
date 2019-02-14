---
title: JS变量提升
date: 2017-12-11 22:26:18
id: js-variable-promotion
categories: ["前端","JavaScript"]
tags:
  - javascript
description:
---

变量提升即将变量声明提升到它所在作用域的最开始的部分，ES6 之前 JS 只有全局作用域和函数作用域，ES6 加入了块级作用域，用一对花括号{}包裹的部分。变量提升会将函数声明和部分变量声明提升到作用域顶端。例子如下：

<!-- more -->

```javascript
console.log(tt); // undefined

// 全局变量
var tt = "aa";

function test() {
  console.log(tt); // undefined
  // 局部变量
  var tt = "dd";
  console.log(tt); // dd
}

test();
```

解释上述的原因，由于变量提升，代码实际执行如下：

```javascript
// tt 所在全局作用域，提升到全局域顶部
var tt;

console.log(tt); // 所以此处没有报错，打印 undefined

// 此处，赋值
tt = "aa";

function test() {
  // 函数作用域，同样变量提升
  var tt;

  console.log(tt); // 此处为函数作用域内的 tt，所以打印 undefined

  tt = "dd";

  console.log(tt); // 此处有值，打印 dd
}

test();
```

ES6 中新增的 `let` & `const`，不会产生变量提升现象：

```javascript
console.log(a); // Uncaught ReferenceError: a is not defined

let a = "a";

console.log(b); // Uncaught ReferenceError: b is not defined

let b = "b";
```

- `let`：用于声明变量，只在 let 所在的作用域内有效
- `const`：用于声明一个常量（只是保证指向的地址不可改变），只能在声明时进行赋值
