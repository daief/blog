---
title: 测试新写的站点生成器
date: 2021-07-25 22:18:00
id: blog-playground-post-for-test
draft: true
tags:
keywords:
description: 测试页面
---

这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言，这里是概览、前言。

<!-- more -->

这里是正文这里是正文这里是正文这里是正文这里是正文这里是正文这里是正文。

## 标题 2

文字。

### 标题 3

文字。

#### 标题 4

文字。

##### 标题 5

文字。

###### 标题 6

文字。

## 测试绘图

默认主题：

```mermaid
graph LR
	App --> a1[A] --> x1[X v1.01] --> a --> ax --> axc --> a25
	App --> b1[B] --> x2[X v2.0]:::strong

```

指定 `forest` 主题：

```mermaid
%%{init: {'theme':'forest'}}%%
graph LR
  classDef strong fill:#f96;

	App --> a1[A] --> x1[X v1.01] --> a --> ax --> axc --> a25
	App --> b1[B] --> x2[X v2.0]:::strong

```

测试图片：

网络：

![](https://avatars.githubusercontent.com/u/19222089?v=4)

本地：

![aaaaa](/images/body.jpg 'xxxxaaa')

```ts
interface Type {
  name?: string;
  id: string;
}

const a: Type = {
  name: 'name-name',
  id: 'id',
};
```
