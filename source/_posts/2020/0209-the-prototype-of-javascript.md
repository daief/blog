---
title: JavaScript 原型相关
date: 2020-02-09 10:41:22
id: the-prototype-of-javascript
categories: ['前端', 'JavaScript']
tags:
  - JavaScript
keywords:
  - javascript
  - prototype chain
description:
---

一直以来没有系统地去学习过原型相关的知识概念，虽然平时直接使用不多，但时常会看到，有必要搞明白一点。

<!-- more -->

## 原型

主要涉及两个对象属性：`prototype` 和 `__proto__`。

### prototype

访问 `prototype` 表示访问一个对象的 `原型对象`。

```js
console.log(Object.prototype);

function Foo() {}
console.log(Foo.prototype);
```

> 所有函数（function）都存在默认的原型对象，而实例对象默认没有 `prototype` 属性。

```js
function Foo() {}
console.log(Foo.prototype); // 输出原型对象

const foo = new Foo();
console.log(foo.hasOwnProperty('prototype')); // false
```

对于 `原型对象`，没能找到比较正式的概念说明，不过具有以下特点和作用：

1. 是一个对象
2. 对象上有一个 `constructor` 属性，**指向原型对象的构造函数、或者说函数本身**
3. 通过原型对象可以实现对象的属性继承，所有都过该构造器实例化得到的对象都能访问到原型对象上的属性和方法

```js
function Foo() {}

const foo = new Foo();

foo.a; // undefined
Foo.prototype.a = 2;

console.log(Foo.prototype);
// {
//  a: 2
//  constructor: ƒ Foo()
//  __proto__: Object
// }

console.log(Foo.prototype.constructor === Foo); // true

foo.a; // 2
```

**对于原型对象的操作应慎重，会影响到所有的实例对象（包括已存在的对象）；同时应避免下面的写法：**

```js
function Foo() {}

// ❌ 会破坏原来的原型对象以及原型链
Foo.prototype = {
  a: 2,
  b: 3,
};

// ✅ 需要同时添加多个属性时
Object.assign(Foo.prototype, {
  a: 2,
  b: 3,
});
```

### \_\_proto\_\_

> ❗️ 虽然各大浏览都实现了该属性，但该属性不是语言的标准 ，不要直接在生产环境中使用。
>
> 取而代之的应使用 `Object.getPrototypeOf()` 和 `Object.setPrototypeOf()` 访问器来访问，这等同于直接通过属性 `__proto__` 来操作。

```js
const obj = {};
obj.__proto__ === Object.getPrototypeOf(obj); // true
```

为了方便书写，后文中依旧使用 `__proto__`。

`__proto__` 同样用于访问对象的 `原型对象`，与 `prototype` 不同的一点是所有对象（不包含 `null` 和 `undefined`）都默认存在该属性。该属性是一个内部属性，所以需要通过该节开头部分提到的特殊方式去访问。

```js
function Foo() {}
const foo = new Foo();

foo.__proto__; // 访问实例 foo 的原型对象

// 上一节可通过 Foo.prototype 访问到原型对象
// 实际上这两者是相等的
console.log(foo.__proto__ === Foo.prototype); // true
```

### 原型链

> JavaScript 常被描述为一种基于原型的语言 (prototype-based language)——每个对象拥有一个原型对象，对象以其原型为模板、从原型继承方法和属性。原型对象也可能拥有原型，并从中继承方法和属性，一层一层、以此类推。这种关系常被称为原型链 (prototype chain)，它解释了为何一个对象会拥有定义在其他对象中的属性和方法。

有如下对象，依次查看原型对象：

```js
function Foo() {}
Foo.prototype.a = 2;

const foo = new Foo();
```

```js
// 等价于 Foo.prototype
foo.__proto__;
// {
//  a: 2
//  constructor: ƒ Foo()
//  __proto__: Object
// }
```

```js
// 相当于查看 Foo `原型对象` 的 `原型对象`，即
// Foo.prototype.__proto__
foo.__proto__.__proto__;
// {
//  constructor: ƒ Object()
//  hasOwnProperty: ƒ hasOwnProperty()
//  isPrototypeOf: ƒ isPrototypeOf()
//  propertyIsEnumerable: ƒ propertyIsEnumerable()
//  toString: ƒ toString()
//  valueOf: ƒ valueOf()
//  toLocaleString: ƒ toLocaleString()
// }
```

```js
// 一级级向上，最终指向 null
foo.__proto__.__proto__.__proto__;
// null
```

可以发现 `foo.__proto__.__proto__.__proto__` 构成了一条原型链，当访问 `foo` 对象的属性或方法时，如果对象本身不存在时，就也按照这样的链一层层向上查找、直至找到或找不到。

所以，可以看出实例对象 `foo` 为什么不仅能访问属性 `a`，还拥有 `hasOwnProperty`、`toString` 等方法：

```js
foo.a; // 2
foo.hasOwnProperty('a'); // false
foo.toString(); // '[object Object]'
```

> ❗️ 此外还需要注意：
>
> - 原型链的编辑应十分小心
> - 原型链不宜过长，会影响属性访问的耗时

最后，在 JavaScript 中，所有的对象的原型都指向于 `Object`，最终指向 `null`。

```js
const n = 1;
n.__proto__; // Number
n.__proto__.__proto__; // Object
n.__proto__.__proto__.__proto__; // null
```

借用一张图总结一下：

![prototype-chain](the-prototype-of-javascript/prototype-chain.jpg '图解 javascript 原型链')

## 结语

就简单理解，这些就是指来指去的一个问题，理一理后也并不复杂，以及学习了原型对象的一个作用。

原型、原型链是实现 JavaScript 面向对象编程的重要依据，下次可能学一学 `class`、`extends` 的原生实现，但现在看来应该也八九不离十了（~~迷之自信~~）。

---

参考资料：

- [对象原型](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Objects/Object_prototypes)
- [Object.prototype](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype)
- [继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [Class 的基本语法](https://es6.ruanyifeng.com/#docs/class)
- [图解 JavaScript 原型链](https://juejin.im/post/5d713de26fb9a06ad3474c15#comment)
