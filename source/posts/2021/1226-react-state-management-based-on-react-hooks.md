---
title: 基于 React Hooks 的小型状态管理
date: 2021-12-26 18:20:42
id: react-state-management-based-on-react-hooks
categories: ['前端', 'React']
tags:
  - React
keywords:
  - react state management
  - shared-state
  - hooks
description:
---

一年又又又要过去了，在这 2021 年的尾巴，来写写 React 的状态管理。

本文主要介绍一种基于 React Hooks 的状态共享方案，介绍其实现，并总结一下使用感受，目的是在状态管理方面提供多一种选择方式。

<!-- more -->

## 实现基于 React Hooks 的状态共享

React 组件间的状态共享，是一个老生常谈的问题，也有很多解决方案，例如 Redux、MobX 等。这些方案很专业，也经历了时间的考验，但私以为他们不太适合一些不算复杂的项目，反而会引入一些额外的复杂度。

实际上很多时候，我不想定义 mutation 和 action、我不想套一层 context，更不想写 connect 和 mapStateToProps；我想要的是一种轻量、简单的状态共享方案，简简单单引用、简简单单使用。

随着 Hooks 的诞生、流行，我的想法得以如愿。

接着介绍一下我目前在用的方案，将 Hooks 与发布/订阅模式结合，就能实现一种简单、实用的状态共享方案。因为代码不多，下面将给出完整的实现。

```ts
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

/**
 * @see https://github.com/facebook/react/blob/bb88ce95a87934a655ef842af776c164391131ac/packages/shared/objectIs.js
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x: any, y: any): boolean {
  return (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y);
}

const objectIs = typeof Object.is === 'function' ? Object.is : is;

/**
 * @see https://github.com/facebook/react/blob/933880b4544a83ce54c8a47f348effe725a58843/packages/shared/shallowEqual.js
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA: any, objB: any): boolean {
  if (is(objA, objB)) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      !is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false;
    }
  }

  return true;
}

const useForceUpdate = () => useReducer(() => ({}), {})[1] as VoidFunction;

type ISubscriber<T> = (prevState: T, nextState: T) => void;

export interface ISharedState<T> {
  /** 静态方式获取数据, 适合在非组件中或者数据无绑定视图的情况下使用 */
  get: () => T;
  /** 修改数据，赋予新值 */
  set: Dispatch<SetStateAction<T>>;
  /** （浅）合并更新数据 */
  update: Dispatch<Partial<T>>;
  /** hooks方式获取数据, 适合在组件中使用, 数据变更时会自动重渲染该组件 */
  use: () => T;
  /** 订阅数据的变更 */
  subscribe: (cb: ISubscriber<T>) => () => void;
  /** 取消订阅数据的变更 */
  unsubscribe: (cb: ISubscriber<T>) => void;
  /** 筛出部分 state */
  usePick<R>(picker: (state: T) => R, deps?: readonly any[]): R;
}

export type IReadonlyState<T> = Omit<ISharedState<T>, 'set' | 'update'>;

/**
 * 创建不同实例之间可以共享的状态
 * @param initialState 初始数据
 */
export const createSharedState = <T>(initialState: T): ISharedState<T> => {
  let state = initialState;
  const subscribers: ISubscriber<T>[] = [];

  // 订阅 state 的变化
  const subscribe = (subscriber: ISubscriber<T>) => {
    subscribers.push(subscriber);
    return () => unsubscribe(subscriber);
  };

  // 取消订阅 state 的变化
  const unsubscribe = (subscriber: ISubscriber<T>) => {
    const index = subscribers.indexOf(subscriber);
    index > -1 && subscribers.splice(index, 1);
  };

  // 获取当前最新的 state
  const get = () => state;

  // 变更 state
  const set = (next: SetStateAction<T>) => {
    const prevState = state;
    // @ts-ignore
    const nextState = typeof next === 'function' ? next(prevState) : next;
    if (objectIs(state, nextState)) {
      return;
    }
    state = nextState;
    subscribers.forEach((cb) => cb(prevState, state));
  };

  // 获取当前最新的 state 的 hooks 用法
  const use = () => {
    const forceUpdate = useForceUpdate();

    useEffect(() => {
      let isMounted = true;
      // 组件挂载后立即更新一次, 避免无法使用到第一次更新数据
      forceUpdate();
      const un = subscribe(() => {
        if (!isMounted) return;
        forceUpdate();
      });
      return () => {
        un();
        isMounted = false;
      };
    }, []);

    return state;
  };

  const usePick = <R>(picker: (s: T) => R, deps = []) => {
    const ref = useRef<any>({});

    ref.current.picker = picker;

    const [pickedState, setPickedState] = useState<R>(() =>
      ref.current.picker(state),
    );

    ref.current.oldState = pickedState;

    const sub = useCallback(() => {
      const pickedOld = ref.current.oldState;
      const pickedNew = ref.current.picker(state);
      if (!shallowEqual(pickedOld, pickedNew)) {
        // 避免 pickedNew 是一个 function
        setPickedState(() => pickedNew);
      }
    }, []);

    useEffect(() => {
      const un = subscribe(sub);
      return un;
    }, []);

    useEffect(() => {
      sub();
    }, [...deps]);

    return pickedState;
  };

  return {
    get,
    set,
    update: (input: Partial<T>) => {
      set((pre) => ({
        ...pre,
        ...input,
      }));
    },
    use,
    subscribe,
    unsubscribe,
    usePick,
  };
};
```

拥有 `createSharedState` 之后，下一步就能轻易地创建出一个可共享的状态了，在组件中使用的方式也很直接。

```tsx
// 创建一个状态实例
const countState = createSharedState(0);

const A = () => {
  // 在组件中使用 hooks 方式获取响应式数据
  const count = countState.use();
  return <div>A: {count}</div>;
};

const B = () => {
  // 使用 set 方法修改数据
  return <button onClick={() => countState.set(count + 1)}>Add</button>;
};

const C = () => {
  return (
    <button
      onClick={() => {
        // 使用 get 方法获取数据
        console.log(countState.get());
      }}
    >
      Get
    </button>
  );
};

const App = () => {
  return (
    <>
      <A />
      <B />
      <C />
    </>
  );
};
```

对于复杂对象，还提供了一种方式，用于在组件中监听指定部分的数据变化，避免其他字段变更造成多余的 render：

```tsx
const complexState = createSharedState({
  a: 0,
  b: {
    c: 0,
  },
});

const A = () => {
  const a = complexState.usePick((state) => state.a);
  return <div>A: {a}</div>;
};
```

但复杂对象一般更建议使用组合派生的方式，由多个简单的状态派生出一个复杂的对象。另外在有些时候，我们会需要一种基于原数据的计算结果，所以这里同时提供了一种派生数据的方式。

通过显示声明依赖的方式监听数据源，再传入计算函数，那么就能得到一个响应式的派生结果了。

````ts
/**
 * 状态派生（或 computed）
 * ```ts
 * const count1 = createSharedState(1);
 * const count2 = createSharedState(2);
 * const count3 = createDerivedState([count1, count2], ([n1, n2]) => n1 + n2);
 * ```
 * @param stores
 * @param fn
 * @param initialValue
 * @returns
 */
export function createDerivedState<T = any>(
  stores: IReadonlyState<any>[],
  fn: (values: any[]) => T,
  opts?: {
    /**
     * 是否同步响应
     * @default false
     */
    sync?: boolean;
  },
): IReadonlyState<T> & {
  stop: () => void;
} {
  const { sync } = { sync: false, ...opts };
  let values: any[] = stores.map((it) => it.get());
  const innerModel = createSharedState<T>(fn(values));

  let promise: Promise<void> | null = null;

  const uns = stores.map((it, i) => {
    return it.subscribe((_old, newValue) => {
      values[i] = newValue;

      if (sync) {
        innerModel.set(() => fn(values));
        return;
      }

      // 异步更新
      promise =
        promise ||
        Promise.resolve().then(() => {
          innerModel.set(() => fn(values));
          promise = null;
        });
    });
  });

  return {
    get: innerModel.get,
    use: innerModel.use,
    subscribe: innerModel.subscribe,
    unsubscribe: innerModel.unsubscribe,
    usePick: innerModel.usePick,
    stop: () => {
      uns.forEach((un) => un());
    },
  };
}
````

至此，基于 Hooks 的状态共享方的实现介绍就结束了。

在最近的项目中，有需要状态共享的场景，我都选择了上述方式，在 Web 项目和小程序 Taro 项目中均能使用同一套实现，一直都比较顺利。

## 使用感受

最后总结一下目前这种方式的几个特点：

- 实现简单，不引入其他概念，仅在 Hooks 的基础上结合发布/订阅模式，类 React 的场景都能使用，比如 Taro；
- 使用简单，因为没有其他概念，直接调用 create 方法即可得到 state 的引用，调用 state 实例上的 use 方法即完成了组件和数据的绑定；
- 类型友好，创建 state 时无需定义多余的类型，使用的时候也能较好地自动推导出类型；
- 避免了 Hooks 的“闭包陷阱”，因为 state 的引用是恒定的，通过 state 的 get 方法总是能获取到最新的值：

  ```tsx
  const countState = createSharedState(0);

  const App = () => {
    useEffect(() => {
      setInterval(() => {
        console.log(countState.get());
      }, 1000);
    }, []);
    // return ...
  };
  ```

- 直接支持在多个 React 应用之间共享，在使用一些弹框的时候是比较容易出现多个 React 应用的场景：

  ```tsx
  const countState = createSharedState(0);

  const Content = () => {
    const count = countState.use();
    return <div>{count}</div>;
  };

  const A = () => (
    <button
      onClick={() => {
        Dialog.info({
          title: 'Alert',
          content: <Content />,
        });
      }}
    >
      open
    </button>
  );
  ```

- 支持在组件外的场景获取/更新数据
- 在 SSR 的场景有较大局限性：state 是细碎、分散创建的，而且 state 的生命周期不是跟随 React 应用，导致无法用同构的方式编写 SSR 应用代码

以上，便是本文的全部内容，实际上 Hooks 到目前流行了这么久，社区当中已有不少新型的状态共享实现方式，这里仅作为一种参考。

根据以上特点，这种方式有明显的优点，也有致命的缺陷（对于 SSR 而言），但在实际使用中，可以根据具体的情况来选择合适的方式。比如在 Taro2 的小程序应用中，无需关心 SSR，那么我更倾向于这种方式；如果在 SSR 的同构项目中，那么定还是老老实实选择 Redux。

总之，是多了一种选择，到底怎么选还得视具体情况而定。
