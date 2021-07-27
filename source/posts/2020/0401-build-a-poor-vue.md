---
title: 学写一个乞丐版 Vue
id: build-a-poor-vue
date: 2020-04-02 13:03:54
categories: ['前端', 'Vue']
tags:
  - Vue
keywords:
  - Vue
description:
---

~~没有钱了，肯定要学啊，不学没有钱用。~~

~~看源码是不可能看的，这辈子不可能看的。写东西又不会写，就是看这种东西，才能维持得了生活这样子。~~

~~什么 Github、掘金、知乎上面个个都是人才，说话又好听，技术又厉害，超喜欢在上面逛的。~~

<!-- more -->

## 前言（~~废话~~）

对 Vue（v2.x） 的原理也不能说不知道吧，但又解释不太清楚，试着学写一个乞丐版的 Vue 来加深一下理解，同时也想作为后续阅读源码的一个事前准备。老实说这里的内容基本都是参考别人的，但为了回顾以及加深印象，还是再以文章的形式记录一下好了。

在线 DEMO：[Edit On CodeSandbox.](https://codesandbox.io/s/mock-vue-0otdk?fontsize=14&hidenavigation=1&theme=dark)

既然叫作乞丐版，那么自然要有该有的样子：

- 实现基本是按照参考资料以及自己的理解来着；
- 尤其是指令、事件绑定那里，自己瞎写写的；
- 实现了：
  - 在模板中使用 `{{variable}}` 并绑定值，支持表达式，但一个节点还只能有一个双大括号插值
  - v-model 指令
  - v-show、@click 指令，支持表达式

## 编码实现

为了方便编码和阅读，全都用了 `class` 的写法。

简易的 Vue 由以下几个部分组成：

```text
Vue
├── index.ts
├── Compile.ts
├── Dep.ts
├── Watcher.ts
├── observe.ts
└── utils.ts
```

### index

定义一个 Vue 的类，像下面这样，保持用法上的一致：

```ts
export class Vue {
  $el: HTMLElement;
  $data: any;
  methods;

  constructor(opts: IOption) {
    this.$el = document.querySelector(opts.el);
    this.$data = opts.data;
    this.methods = opts.methods || {};

    // 使 data 变成响应式
    observe(this.$data);
    // 使得直接在 Vue 实例上读/写属性时能直接读/写到 $data、methods 中相应的字段
    proxy(this);
    // 解析 DOM 模板并进行渲染
    new Compile(this.$el, this);
  }
}

// 使用
const vm = new Vue({
  el: '#app',
  data: {
    text: 1,
  },
  methods: {
    // ...
  },
});

vm.text;
// 等价于
vm.$data.text;
```

### observe

`observe` 模块将 `data` 转换成响应式的对象，使用了 `Object.defineProperty`, 通过 `set`，`get` 来设置值与获取值。

> `Dep` 是观察者模式的应用。

在这里同时借助观察者模式当值发生改变的时候将发出 `notify` 进行通知。

```ts
export function observe(data: Record<string, any>) {
  for (let k in data) {
    defineReactive(data, k, data[k]);
  }
}

function defineReactive(obj, key, value) {
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      Dep.target && dep.addSub(Dep.target);
      return value;
    },
    set(newVal) {
      if (newVal === value) {
        return;
      }
      value = newVal;
      dep.notify();
    },
  });
}
```

> 这里的 `Dep.target && dep.addSub(Dep.target)` 是 Vue 中设计比较精妙的一部分，注意到这里是在 getter 中将 Watcher 加入订阅的。
> 或者这么说，当 `Dep.target` 有值，这时候若发生取值操作（如，vm.text），`Dep.target` 就会被加入订阅。

### utils

`utils` 下其实就一个方法：`expressionToFunction`，它的作用可以看作是将一段字符串代码转换成一个函数，并且可以设置这个函数的上下文环境。

```ts
export function expressionToFunction(exp, context) {
  // eslint-disable-next-line
  return new Function('with(this){return ' + exp + '}').bind(context);
}
```

举个例子：

```ts
// 有一个表达式
const expression = `'hello ' + name`;

window.name = 'windowName';

const ctx = {
  name: 'ctxName',
};

expressionToFunction(expression, window)(); // 'hello windowName'

expressionToFunction(expression, ctx)(); // 'hello ctxName'
```

### Compile

`Compile` 来解析模板并渲染，对应的理解与说明以注释的形式标注在代码块中了。

总得来说，根据所给的 DOM 的节点开始向下遍历，逐一进行双括号语法的解析、视图与值的绑定以及指令的相关处理。

```ts
import { Watcher } from './Watcher';
import { expressionToFunction } from './utils';

export class Compile {
  _vm = null;

  constructor(node: HTMLElement, vm: any) {
    this._vm = vm;
    this.walkChildren(node);
  }

  /**
   * 遍历节点，进行解析、绑定、指令的处理
   */
  walkChildren = el => {
    [].slice.call(el.childNodes).forEach(n => {
      const { nodeType } = n;
      // 节点类型为text
      if (nodeType === 3) {
        return this.compileElement(n);
      }
      // 注释类型，先不管
      if (nodeType === 8) {
        return;
      }
      // 元素类型
      if (nodeType === 1) {
        this.parseDirective(n);
      }
      this.walkChildren(n);
    });
  };

  /**
   * 文本节点类型，解析双花括号语法，并响应值（data）的变化以进行更新
   */
  compileElement(node) {
    const reg = /\{\{(.*)\}\}/;
    const { nodeValue } = node;

    if (!reg.test(nodeValue)) {
      return;
    }

    // 获取双花括号中匹配到的字符串，即表达式
    const expression = RegExp.$1;

    // 然后对这个表达式实例化一个 Watcher 对象，实现了将 `这个表达式` 与 `表达式中涉及的值` 绑定的操作
    new Watcher(this._vm, expression, (newV, oldV) => {
      /**
       * 当 `初始化` 以及 `表达式的值变化` 时，这个回调会被触发
       * 在这里，将 DOM 上的值进行更新
       * 即根据正则将双花括号的内容替换成最终的值
       */

      // 一些特殊字符需要转义处理
      const regExpression = expression.replace(/\+|\?|\(|\)/g, _ => '\\' + _);

      const replaceReg = new RegExp('{{\\s*' + regExpression + '\\s*}}');
      node.nodeValue = nodeValue.replace(replaceReg, newV);
    });
  }

  /**
   * 指令的处理（大概
   */
  parseDirective(node) {
    const { attributes } = node;

    [].slice.call(attributes || []).forEach(attr => {
      /**
       * 指令的处理是读取 DOM 上的 attributes 进行逐个解析
       * 值同样要作为表达式进行处理
       */
      const { nodeName, nodeValue } = attr;
      const expression = nodeValue;

      if (nodeName === 'v-model') {
        /**
         * 这里简单实现了一下 v-model
         * 监听原生 input 事件，值变化时改变 vm （Vue 实例）上相应的值
         * 同时建立一个 Watcher，当值变化时，改变节点的 value
         * 从而实现了双向绑定的语法糖
         */
        node.addEventListener('input', e => {
          // 给相应的 data 属性赋值，进而触发该属性的 set 方法
          // 触发 set vm[name]
          this._vm[nodeValue] = e.target.value;
        });

        return new Watcher(this._vm, nodeValue, val => {
          node.value = val || '';
        });
      } // v-model
    });
  }
}
```

### Watcher

从上一部分也可以大致看出，`Watcher` 能够实现对一个表达式的监听，当表达式的值发生变化时触发相应的回调。然后这是 `Watcher` 的具体实现：

```ts
import { Dep } from './Dep';
import { expressionToFunction } from './utils';

export class Watcher {
  vm;
  expression: string;
  value = null;
  cb;
  getValue;

  constructor(vm, expression, cb?) {
    this.vm = vm;
    this.expression = expression;
    this.cb = cb;
    this.getValue = expressionToFunction(expression, vm);
    this.value = this.getValue();
    this.update();
  }

  update() {
    const oldValue = this.value;
    this.get();
    this.cb && this.cb(this.value, oldValue);
  }

  // 获取 data 的属性值
  get() {
    Dep.target = this;
    // 触发相应属性的 get
    this.value = this.getValue();
    Dep.target = null;
  }
}
```

`getValue` 是一个方法，用来获取 `表达式的值`，注意这个属性是通过 `expressionToFunction(expression, vm)` 得到的，并且这个方法的上下文是 Vue 实例。

比如说，在模板中有这样的一段：`<div>{% raw %}{{text % 2 === 0 ? 1 : 2}}{% endraw %}</div>`；在 `Compile` 中解析后的 `expression` 是这样的 `'text % 2 === 0 ? 1 : 2'`，经过 `expressionToFunction(expression, vm)` 处理得到的 `getValue` 可以认为是这样的：

```ts
this.getValue = () => {
  return vm.text % 2 === 0 ? 1 : 2;
};
```

从而调用 `getValue` 的时候就能获取到对应表达式的值。

`update` 方法当接收到 `Dep` 的通知时会被调用。

最后就是 `get` 方法，十分简短：

```ts
Dep.target = this;
this.value = this.getValue();
Dep.target = null;
```

此处与 `observe` 一节中就关联上了，`Dep.target` 实际上作为一个全局属性用来临时地传值，只是将其设置成了 `Dep` 的静态属性而已。`get` 方法就三个步骤：

- 将自身 `Watcher` 实例赋值给 `Dep.target`，通过这一点达到目的同时借助了 JavaScript 单线程运行的特点；
- 使用 `this.getValue()` 计算表达式值，结合前面的理解，当这一过程中涉及 `vm.xxx` 的操作时，**当前 Watcher 将会被加入订阅**；
- 释放 `Dep.target`；

### Dep

这是一个简单的观察者模式的实现，写得很简单了，调用 `notify` 时将会通知到所有的订阅者。

```ts
import { Watcher } from './Watcher';
export class Dep {
  static target: Watcher | null = null;

  subs: Set<Watcher> = new Set();

  addSub(sub: Watcher) {
    this.subs.add(sub);
  }

  notify() {
    this.subs.forEach(sub => {
      sub.update();
    });
  }
}
```

### 使用

至此，乞丐版 Vue 的实现大体就完成了，接着就可以假装是一个真正的 Vue 了。

```html
<div id="app">
  hello {% raw %}{{ text }}{% endraw %}
  <br />
  <input v-modle="text" />
</div>
```

```ts
import { Vue } from './Vue';

const vm = new Vue({
  el: '#app',
  data: {
    text: 'world',
  },
});

vm.text; // world
vm.text = 'Vue';
vm.text; //
```

## 结语

可能都知道 Vue 2 是通过 `Object.defineProperty` 实现的，但稍微具体一点的细节我其实是不清楚的，这样一次简易的实现过程，让我的认知提高了不少。

都说这个挺简单的，但一开始看的时候却并不容易看明白，之后自己照着写了一遍才有了一点感觉，还是要多多实践。

---

参考资料：

- [实现一个简易的 Vue](https://juejin.im/post/5c2202b75188250850606d9c)
- [100 行代码实现一个迷你 Vue](https://zhuanlan.zhihu.com/p/29629337)
