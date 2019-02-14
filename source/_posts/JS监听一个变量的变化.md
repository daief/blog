---
title: JS监听一个变量的变化
date: 2017-11-22 16:18:10
id: js-watch-variable-change
categories: ["前端","JavaScript"]
tags:
  - javascript
description:
---

js 监听一个值的变化，当值变化之后能够触发一些操作。

<!-- more -->

> https://blog.daraw.cn/2016/08/17/how-to-monitor-changes-of-js-variable/

### defineProperty （ES5）

> 首先 IE8 及更低版本 IE 是无法使用的，而且这个特性是没有 polyfill 的，无法在不支持的平台实现，这也是基于 ES5getter 和 setter 的 Vue.js 不支持 IE8 及更低版本 IE 的原因。也许有人会提到 avalon，avalon 在低版本 IE 借助 vbscript 一些黑魔法实现了类似的功能。
> 除此之外，还有一个问题就是修改数组的 length，直接用索引设置元素如 items[0] = {}，以及数组的 push 等变异方法是无法触发 setter 的。

```javascript
// 监听变量的变化 es5 defineProperty
function Watch(v, getcall, setcall) {
  var val = v;
  Object.defineProperty(this, "val", {
    get: function() {
      getcall(val);
      return val;
    },
    set: function(value) {
      var old = val;
      val = value;
      setcall(old, val);
    }
  });
}

var count = new Watch(
  0,
  function(v) {
    console.log("get", v);
  },
  function(old, newv) {
    console.log("set", "old:", old, "new:", newv);
  }
);

count.val = 1; // 触发set回调

alert(count.val); // 触发get回调
```

### Proxy （ES6）

```javascript
var p = new Proxy(target, handler);
// target为目标对象，可以是任意类型的对象，比如数组，函数，甚至是另外一个代理对象。
// handler为处理器对象，包含了一组代理方法，分别控制所生成代理对象的各种行为。
```

```javascript
var a = new Proxy(
  {},
  {
    get: function(obj, prop) {
      console.log("get:", prop);
      return true;
    },
    set: function(obj, prop, value) {
      obj[prop] = value;

      console.log("obj:", obj, "prop:", prop, "value:", value);

      return true;
    }
  }
);

a.val = 100; // obj: {val: 100} prop: val value: 100

var b = a.val; // get: val
```

> Proxy 的能力远不仅此。
