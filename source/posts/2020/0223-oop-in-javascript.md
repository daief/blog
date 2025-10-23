---
title: JavaScript 中的面向对象
date: 2020-02-23 13:19:07
id: oop-in-javascript
categories: ['前端', 'JavaScript']
tags:
  - JavaScript
keywords:
  - javascript
  - oop
  - object oriented programming
description:
---

在 JavaScript 中没有类的概念，因此它的对象与基于类的语言中的对象不同。

> ECMA-262 把对象定义为：无序属性的集合，其属性可以包含基本值、对象或函数。

一直以来在编程中都是使用 `class`、`extends` 关键字，而这实际上是 ES6 中添加的语法糖。在熟练使用语法糖的同时，有必要了解其背后的原生实现。

<!-- more -->

## 创建对象

“类”的一个重要的作用是作为模板来使用，以便于批量创建对象，根据资料简单认识一下创建对象的各种模式。

### 工厂模式

因为 JavaScript 中没有类，开发人员发明了一种函数，用函数封装特定的模板。

```js
function createPerson(name, age) {
  var o = {
    name: name,
    age: age,
    say: function () {
      console.log(this.name);
    },
  };
  return o;
}

var p1 = createPerson('Mike', 16);
var p2 = createPerson('Alice', 22);
```

`createPerson` 能根据参数返回一个“Person”对象，可以重复调用以得到多个对象。

> 工厂模式虽然解决了创建多个相似对象的问题，但却没有解决对象识别的问题，即怎样知道 p1 对象的类型是什么。

### 构造函数模式

JavaScript 语言中，生成实例对象的传统方法是通过构造函数。

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.say = function () {
    console.log(this.name);
  };
}

var p1 = new Person('Mike', 16);
var p2 = new Person('Alice', 22);
```

与工厂模式的不同处在于：

- 没有显示地创建对象
- 直接将属性和方法赋值给了 `this`
- 没有 `return` 语句
- 使用时结合 `new` 操作符

> 必须要结合 `new` 操作符进行调用，否则单纯 `Person()` 的调用与普通方法一样，并且得不到预期的效果。

当使用 `new` 操作符调用构造函数时，会经历四个阶段：

- 创建一个对象
- 将构造函数中的上下文（`this`）赋给新对象
- 执行构造函数中的代码（为对象添加属性）
- 返回新对象

`p1`、`p2` 分别是 `Person` 的不同实例，这两个实例都有一个 `constructor` 属性指向 `Person`，即

```js
p1.constructor === Person; // true

p2.constructor === Person; // true
```

或者使用 `instanceof` 操作符。

```js
p1 instanceof Person; // true
p2 instanceof Person; // true
```

### 原型模式

> 定义在原型上的属性被共享给所有的实例对象（需要提前具备原型的相关知识）。

```js
function Person() {}

Person.prototype.name = 'Name';
Person.prototype.age = 1;
Person.prototype.say = function () {
  console.log(this.name);
};

var p1 = new Person();
var p2 = new Person();

p1.name = 'Mike';

p1.name; // Mike，实例的 name 属性
p2.name; // Name，原型上的 name 属性
```

通过 `hasOwnProperty` 方法可以判断访问的是实例属性还是原型属性。

```js
p1.hasOwnProperty('name'); // true
p2.hasOwnProperty('name'); // false
```

若按照上述方式，省略了构造函数传参的步骤，所有实例对象都得到了相同的属性值，可通过组合以进行解决。

### 组合使用构造函数模式和原型模式

一般，实例的方法可以共享，而一些成员属性是各自不同的。保持了构造函数模式的灵活又同时解决了每次实例方法重复创建的问题。

> 在前文构造函数模式中，`p1.say !== p2.say`。

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.hobbies = [];
}

Person.prototype.say = function () {
  console.log(this.name);
};

var p1 = new Person('Mike', 16, ['movie', 'music']);
var p2 = new Person('Alice', 22, ['book']);

p1.say === p2.say; // true
```

### ES6 class 写法

`class` 可以看成构造函数的另一种写法。

语法糖写法，使得 OOP 的概念更容易被理解。

```js
class Person {
  static foo = 1;

  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  say() {
    console.log(this.name);
  }
}

const p = new Person('Mike', 17);

p.hasOwnProperty('name'); // true
p.hasOwnProperty('say'); // false
```

可看成是如下的原生写法。

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.say = function () {
  console.log(this.name);
};

Person.foo = 1;

const p = new Person('Mike', 17);
```

## 继承

继承是面向对象中重要的概念，应用上也十分频繁。JavaScript 中只支持实现继承，而且主要是依靠原型链来实现。

### 原型链

定义了两个类型，分别拥有各自的属性和方法。`SubType` 继承于 `SuperType`；而继承是通过创建 `SuperType` 的实例，并将该实例赋值给 `SubType.prototype` 而实现的。

```js
function SuperType() {
  this.prop = true;
}

SuperType.prototype.getSuperValue = function () {
  return this.prop;
};

function SubType() {
  this.subProp = false;
}
// 继承 SuperType
SubType.prototype = new SuperType();

SubType.prototype.getSubType = function () {
  return this.subProp;
};

var sub = new SubType();

sub.getSuperValue(); // true
sub.getSubType(); // false
```

这种写法下需要注意：

- `sub` 实例的构造函数 `sub.constructor` 指向父类 `SuperType`
- 向子类添加新方法或重写父类方法时要在原型赋值之后

还有个主要的问题是，子类的原型使用的是父类的实例，那么当父类中的属性存在引用类型时，该值将被所有子类实例共享。

```js
function SuperType() {
  this.colors = [];
}

function SubType() {
  this.subProp = false;
}
SubType.prototype = new SuperType();

var sub1 = new SubType();
var sub2 = new SubType();

sub1.colors === sub2.colors; // true

sub1.colors.push('red');

sub2.colors; // ['red']
```

### 借用构造函数

```js
function SuperType() {
  this.colors = [];
  // 方法需要定义在构造函数中才能被继承
  this.getColors = function () {
    return this.colors;
  };
}

function SubType() {
  SuperType.call(this);
}

var sub1 = new SubType();
var sub2 = new SubType();

sub1.colors === sub2.colors; // false
```

该模式的主要问题在于：

- 在父类原型中定义的方法对子类是不可见的，因为此处父类和子类的原型链实际上并无关联

### 组合继承

> 组合继承（combination inheritance）有时候又叫作伪经典继承，指的是将原型链和借用构造函数的技术组合到一块，从而发挥二者之长的一种继承模式。其背后的思路是使用原型链实现对原型属性和方法的继承，而通过借用构造函数来实现对实例属性的继承。

```js
function SuperType(name) {
  this.colors = [];
  this.name = name;
}

SuperType.prototype.sayName = function () {
  console.log(this.name);
};

function SubType(name, age) {
  // 继承实例属性
  SuperType.call(this, name);
  this.age = age;
}

// 继承原型属性和方法
SubType.prototype = new SuperType();

SubType.prototype.sayAge = function () {
  console.log(this.age);
};

var sub1 = new SubType('Mike', 17);
var sub2 = new SubType('Alice', 20);

sub1.colors === sub2.colors; // false

sub1.sayName(); // Mike
sub1.sayAge(); // 17

sub2.sayName(); // Alice
sub2.sayAge(); // 20
```

> 组合继承避免了原型链和借用构造函数的缺陷，融合了它们的优点，成为 JavaScript 中最常用的继承模式。而且，`instanceof` 和 `isPrototypeOf()` 也能够用于识别基于组合继承创建的对象。

### 寄生组合式继承

这种通常被认为是引用类型最理想的继承范式。

在前文的组合继承中，会调用两次父类的构造函数，而寄生组合式继承则能避免这种现象。而所谓寄生组合式继承的基本思路是，**不必为了指定子类型的原型而调用超类型的构造函数，我们所需要的无非就是父类原型的一个副本而已。**

```js
/**
 * 本质上是执行了一次浅拷贝，ES5 中新增了 Object.create 方法以进行规范化
 */
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

/**
 * - 创建父类原型的副本
 * - 复制原型副本的 constructor 属性，用于弥补重写原型导致默认 constructor 丢失的问题
 * - 将副本复制给子类原型
 */
function inheritPrototype(subType, superType) {
  var prototype = object(superType.prototype);
  prototype.constructor = subType;
  subType.prototype = prototype;
}

// --------------------

function SuperType(name) {
  this.colors = [];
  this.name = name;
}

SuperType.prototype.sayName = function () {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}

// 继承原型
inheritPrototype(SubType, SuperType);

SubType.prototype.sayAge = function () {
  console.log(this.age);
};
```

### extends

使用 `extends` 就十分简洁、易读了，而且不需要顾虑那么多。

```js
class SuperType {
  constructor(name) {
    this.name = name;
    this.colors = [];
  }

  sayName() {
    console.log(this.name);
  }
}

class SubType extends SuperType {
  constructor(name, age) {
    super(name);
    this.age = age;
  }

  sayAge() {
    console.log(this.age);
  }
}

var sub1 = new SubType('Mike', 17);
var sub2 = new SubType('Alice', 20);

sub1.constructor === SubType; // true

sub1.colors === sub2.colors; // false

sub1.sayName(); // Mike
sub1.sayAge(); // 17

sub2.sayName(); // Alice
sub2.sayAge(); // 20

sub1.hasOwnProperty('name'); // true
sub1.hasOwnProperty('sayName'); // false
sub1.hasOwnProperty('sayAge'); // false
```

## 结语

老实说，从未使用原生写法写过类与继承，我想以后应该也不大会自己这样去手动实现，不过了解一下原生实现对于语言的理解是十分有帮助的。

一直以来，都是使用语法糖，而后借助 TypeScript 或 babel 进行降级。也十分建议这么去做，不容易出错且简单、易读。

---

参考资料：

- 《JavaScript 高级程序设计（第 3 版）》
- [《ES6 入门教程》- Class 的基本语法](https://es6.ruanyifeng.com/#docs/class)。
- [《ES6 入门教程》- Class 的继承](https://es6.ruanyifeng.com/#docs/class-extends)。
