---
title: TypeScript 之嵌套数组与深度可选类型
date: 2019-09-08 19:22:56
id: typescript-types-of-nested-array-and-deep-partial
categories: ["前端", "TypeScript"]
tags:
  - TypeScript
keywords:
  - TypeScript
  - 嵌套数组
  - 深度可选
  - deep-array
  - deep-partial
description:
---

# 嵌套数组类型

以下类型可用于描述嵌套的数组类型。

<!-- more -->

```ts
interface DeepArray<T> extends Array<T | DeepArray<T>> {}

const array: DeepArray<string | boolean> = [
  'string',
  true,
  ['string'],
  [true, ['string']],
  [[['string', false, 'string']]],
];

const bArray: DeepArray<string | boolean> = [1]; // Error
```

> [数组 – 在 TypeScript 中描述一个深度嵌套的数组](https://codeday.me/bug/20190516/1114682.html)

# 深度可选类型

以下类型可将一个类型的所有属性、子属性转变为 `Partial`。

```ts
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

interface A {
  a: {
    a1: {
      a2: string;
      b2: string;
    };
    b1: {
      a2: number;
      b2: Array<number | string>;
    };
  };
  b: string;
  c: number[];
}

let t1: DeepPartial<A>;

t1.a.a1.a2; // (property) a2?: string
t1.a.a1.b2; // (property) b2?: string
t1.a.b1.b2; // (property) b2?: (string | number)[]
t1.b; // (property) b?: string
t1.c; // (property) c?: number[]
```

> [How to implement TypeScript deep partial mapped type not breaking array properties](https://stackoverflow.com/questions/45372227/how-to-implement-typescript-deep-partial-mapped-type-not-breaking-array-properti/49936686#49936686)

注：上述类型中的 `extends ... ? ...` 可看作类型中的三元表达式。

```ts
// 若泛型 T 继承于 string，则函数 a 返回的类型为 string，否则为 boolean
function a<T>(arg: T): T extends string ? string : boolean {
  // ...
}

interface MyString extends String {}

a('string'); // function a<string>(arg: string): string
a(1); // function a<number>(arg: number): boolean
a('string' as MyString); // function a<MyString>(arg: MyString): boolean
```
