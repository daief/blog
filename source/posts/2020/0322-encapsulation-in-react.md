---
title: React 中的一些封装
date: 2020-03-22 21:06:34
id: encapsulation-in-react
categories: ['前端', 'React']
tags:
  - React
keywords:
  - react
  - hoc
  - hooks
  - render props
description:
---

结合资料以及一直以来的开发情况，总结记录一下 React 中的封装方式，具体是以下三种：

- HOC
- Render Props
- React Hooks

<!-- more -->

# 前言

> 在线演示：<https://codesandbox.io/s/encapsulation-in-react-g3crf>

本文以一个倒计时的例子结合进行说明，计时器包含三个要素：

- current，当前计数
- start，开始倒计时的方法
- reset，重置计数的方法

首先有一个无状态的纯函数组件，用于展示具体的效果：

```tsx
// FC.tsx
import * as React from 'react';

export interface FCProps {
  name: string;
  current: number;
  start: () => void;
  reset: () => void;
}

const FC: React.FunctionComponent<FCProps> = props => {
  const { name, current, start, reset } = props;
  return (
    <div style={style}>
      <p>name: {name}</p>
      <button onClick={start} className="button">
        Start
      </button>
      <button onClick={reset} className="button">
        Reset
      </button>
      <p>current: {current}</p>
    </div>
  );
};
```

# HOC

HOC 即 High Order Component，又可叫作高阶组件。

特地说明一下只是因为这个名字在一开始给到我的是一种很高大上的感觉，但实际上不是很高深概念。

官方的说明如下：

> A higher-order component is a function that takes a component and returns a new component.

简单来说这种封装方式接受一个组件作为输入，而后返回一个新的组件，常见的一个作用是对组件注入一些 `props`。

用一个具体的例子来介绍 HOC 的使用：

```tsx
// HOC.tsx
import * as React from 'react';

type OuterProps<T> = Omit<T, 'current' | 'start' | 'reset'>;

export default function HOC<T>(
  Component: React.ComponentType<T>,
): React.ComponentType<OuterProps<T>> {
  return props => {
    const [current, setCurrent] = React.useState(60);
    const timer = React.useRef<number | null>();

    const start = () => {
      reset();
      timer.current = setInterval(() => {
        setCurrent(pre => pre - 1);
      }, 1000);
    };

    const reset = () => {
      timer.current && clearInterval(timer.current);
      setCurrent(60);
    };

    React.useEffect(() => {
      if (current < 0) {
        reset();
      }
    }, [current]);

    return React.createElement(Component, {
      current,
      start,
      reset,
      ...props,
    });
  };
}
```

使用的时候十分简单，只需包裹一下，即可获得一个具有倒计时功能的新组件：

```tsx
const Wrapped = HOC<FCProps>(FC);

export default function App() {
  return (
    <div className="App">
      <Wrapped name="Fc With HOC" />
    </div>
  );
}
```

同时可以看到 `Wrapped` 组件的类型已经被推导出来，它的定义如下：

```tsx
const Wrapped: React.ComponentType<Pick<FCProps, 'name'>>;
```

翻译一下就是 `Wrapped` 组件接受的 `props` 是从 `FCProps` 中选出的 `name` 字段，这样的类型提示对于后续编码是十分有帮助的。

> 注意此处的 HOC 类型推导需要在泛型处传入 FCProps，而做得好的处理我记得是不需要的，而关于这部分的先不展开了。

简化一下，HOC 是长这样的，就是接收组件，返回一个新的组件：

```js
export default function HOC<T>(Component) {
  return props => {
    // ...
  };
}
```

可以看到，使用 HOC 轻易地封装了一组有状态的逻辑，从而使得开发时更加清晰和简单。不仅如此，稍加改变 HOC 能变得更加灵活：

```js
// 可配置的 HOC
export default function HOC<T>(options) {
  return Component => {
    return props => {
      // ...
    };
  };
}

// 使用时
const Wrapped = HOC({
  // ... options here
})(FC);
```

此外，HOC 还能对 UI 进行封装：

```tsx
export default function HOC<T>(Component) {
  return props => {
    // ...
    return (
      <div>
        With HOC {/* 添加自定义的 UI */}
        <hr />
        {React.createElement(Component, {
          // ...
        })}
      </div>
    );
  };
}
```

HOC 是十分常见的一种用法，比如 antd 3 中的 `Form.create()(Component)` 、react router 中的 `withRouter(Component)`。

HOC 的方式十分强大，你可以拦截到组件（指 HOC 中传入的组件）的 props，也可以操纵组件的状态，可以获取到组件的实例，可以在 HOC 做很多的事情。**所以，封装的时候务必保持谨慎，不应该破坏一些常理的内容。**

所以，HOC 也是有缺点的，如：

- 因为会注入 props，而注入的 props 可能会与传入的 props 冲突
- 经过 HOC 处理后的组件，需要注意 ref 的使用，不特殊处理的话 ref 将无法获取到想要的组件实例
- 注意被包裹组件的静态属性，不特殊处理的话包裹后的组件将丢失了这些静态属性

# Render Props

`Render Props` 是一种新的封装方式，可以做到与 HOC 相同效果的同时避免 HOC 的问题。这不是一项什么神奇的技术，只是将某个 props 作为 `render` 的一个回调函数。

当使用 Render Props 来封装倒计时可以是这样的：

```tsx
// RenderProps.tsx
const RenderProps = (props: {
  render: (props: ICallbackArg) => React.ReactElement;
}) => {
  const [current, setCurrent] = React.useState(60);
  const timer = React.useRef<number | null>();
  const start = () => {
    reset();
    timer.current = setInterval(() => {
      setCurrent(pre => pre - 1);
    }, 1000);
  };

  const reset = () => {
    timer.current && clearInterval(timer.current);
    setCurrent(60);
  };

  React.useEffect(() => {
    if (current < 0) {
      reset();
    }
  }, [current]);

  return props.render({
    current,
    start,
    reset,
  });
};
```

使用方式如下：

```tsx
<RenderProps render={props => <FC {...props} name="RenderProps" />} />
```

更多的 Render Props 会选择将 `children` 作为这样的 props，此时用起来就会是这样的：

```tsx
<RenderProps>{props => <FC {...props} name="RenderProps" />}</RenderProps>
```

同样地，也可以封装 UI；同时不用再担心 props 冲突、ref 等问题。

不过，这种方式我认为也是有缺点的：

- 就是单纯写起来的时候嵌套会比较多，尤其同时用到多个的时候

# React Hooks

React Hooks 是 React 16.8.0 中出现的新概念，不过到今天的时候已经不能算新了吧，也不多作说明了。

Hooks 的封装如下：

```ts
// Hooks.tsx
import * as React from 'react';

export default function useCountDown() {
  const [current, setCurrent] = React.useState(60);
  const timer = React.useRef<number | null>();

  const start = () => {
    reset();
    timer.current = setInterval(() => {
      setCurrent(pre => pre - 1);
    }, 1000);
  };

  const reset = () => {
    timer.current && clearInterval(timer.current);
    setCurrent(60);
  };

  React.useEffect(() => {
    if (current < 0) {
      reset();
    }
  }, [current]);

  return {
    current,
    start,
    reset,
  };
}
```

使用：

```tsx
export default function App() {
  const props = useCountDown();
  return (
    <div className="App">
      <FC name="With Hooks" {...props} />
    </div>
  );
}
```

这种方式完全就是 hooks 的方式了，优点、局限与常规 hooks 一致了。

# 结语

三种方式在日常开发中都是频繁使用的存在，我不敢说自己使用的时候有多么多么灵活，但的的确确在开发时带来了诸多方便，无论是代码量亦或是解耦方面都有一定的帮助。

> 在童话中，一个人做他想做的事；
> 在现实中，一个人做他能做的事。 -- 「埃莱娜·费兰特」

完。
