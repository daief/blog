---
title: 认识柯里化（currying）
date: 2018-1-4 22:29:17
categories: ['前端', 'JavaScript']
id: what-is-currying
tags:
  - JavaScript
  - currying
---

看文章的时候发现了`柯里化`一词，然而心中毫无概念，于是就查阅了相关资料有了些许认识。

<!-- more -->

### 概念

柯里化（Currying）是把接受多个参数的函数变换成接受一个单一参数(最初函数的第一个参数)的函数，并且返回接受余下的参数且返回结果的新函数的技术。

概念初次看起来比较抽象。

### 实现

```javascript
// 柯里化
function currying(fn) {
  // 提取数组原型的slice方法
  var slice = Array.prototype.slice,
    // 取fn之后的参数并转化为数组
    __args = slice.call(arguments, 1);
  return function () {
    // 将具有length属性的对象（arguments）转成数组
    var __inargs = slice.call(arguments);
    // 合并参数并调用fn
    return fn.apply(null, __args.concat(__inargs));
  };
}
```

使用举例：

我们定义了一个多参的函数`foo`：

```javascript
function foo(a, b, c) {
  // ...
  console.log(a, b, c);
  // ...
}

// 使用的时候
foo(1, 2, 3); // 1 2 3
foo(1, 3, 6); // 1 3 6
```

将其进行柯里化**固定首位参数**：

```javascript
// 将foo的首位参数固定为1，得到新的函数foo1
var foo1 = currying(foo, 1);

// 之后我们使用foo1
foo1(2, 3); // 1 2 3
foo1(3, 6); // 1 3 6
```

这种情况就很利于当参数`a=1`的时候，通过柯里化固定参数`a`，之后使用的时候就不必重复传入`1`。
上述`foo1(b, c)`相当于`foo(1, b, c)`。
[借用某位老哥一句话](https://www.zhihu.com/question/40374792/answer/86268208)，感觉十分助于认识柯里化：

> 柯里化可看成一种对高阶函数的降阶处理。
> 把原本：
> function(arg1,arg2) 变成 function(arg1)(arg2)
> function(arg1,arg2,arg3) 变成 function(arg1)(arg2)(arg3)
> function(arg1,arg2,arg3,arg4) 变成 function(arg1)(arg2)(arg3)(arg4)
> ……

再看一下固定两位参数：

```javascript
// 柯里化，固定参数a，b（固定两个个参数），使用foo2只需要传入参数c
var foo2 = currying(foo, 'A', 'B');
foo2('C'); // A B C
foo2('C1'); // A B C1
```

这些就是目前对于柯里化初步的认识。

最后，看着柯里化的作用也有了些许理解。

> 柯里化其实本身是固定一个可以预期的参数，并返回一个特定的函数，处理批特定的需求。这增加了函数的适用性，但同时也降低了函数的适用范围。
> 函数柯里化，是固定部分参数，返回一个接受剩余参数的函数，也称为部分计算函数，目的是为了缩小适用范围，创建一个针对性更强的函数。
