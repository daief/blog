---
title: 微信网页开发踩坑记录
date: 2019-09-07 14:51:32
id: troubles-with-web-developing-in-weixin
categories: ['前端']
tags:
keywords:
  - 微信
  - wx
  - 踩坑
  - 前端
description:
---

如标题所示，本文用于记录在微信中开发页面时所遇到的坑。

<!-- more -->

## 正文

### iOS 中收起软键盘时页面不恢复 - 2019-08

描述：页面上有一个 input 输入框，输入框聚焦时会出现软键盘，同时页面会被软键盘顶起来（页面高度被压缩）。点击输入框其他地方让输入框失去焦点，使得软键盘收起。

期望结果：软键盘收起，页面恢复。

实际表现：在 iOS 中，软键盘收起，但被顶起的页面没有恢复，需要人为滚动一下页面才会恢复。

解决方式：为 input 绑定 `blur` 事件，事件触发时主动调用页面滚动方法。

```js
document.getElementById('myInput').addEventListener('blur', () => {
  window.scrollTo(0, 0);
});
```

当时的页面只有一屏多一点点，所以使用 `window.scrollTo(0, 0)` 滚动到顶部是没有问题。但页面若是比较长，input 在中间部分，这样带来的体验显示是不好的。因此是否可以用另一个滚动 API（该方式未实践过）。

```js
document.getElementById('myInput').addEventListener('blur', () => {
  window.scrollBy(0, 1); // y 轴进行少量滚动
});
```

### iOS 中 input 的 placeholder 不垂直居中 - 2019-08

描述：常常，会对单行输入框 input 设置 CSS 的 `line-height` 和 `height` 以达到输入文案、placeholder 垂直居中的效果。

实际表现：在 iOS 中，input 的 placeholder 没有垂直居中。

解决方式：`line-height` 设置为 `normal` 或者使用 `padding`、`margin` 让 input 看起来垂直居中。

相关阅读：

- [MDN - line-height](https://developer.mozilla.org/zh-CN/docs/Web/CSS/line-height)

### iOS 中 Vue 的前端路由与 URL 相关的问题 - 2019-08

描述：前提，Vue 项目，路由模式为 browser。在微信中打开了一个 Vue 的 SPA 页面，初次展示的页面记为 `A`，前端路由跳转至页面 `B`。此时执行操作：在浏览器中打开、复制链接。

期望结果：打开页面 `B`、得到页面 `B` 的链接。

实际表现：打开了页面 `A`、得到的是页面 `A` 的链接。

解决方式：放弃前端路由的跳转方式，使用原生 `location` 进行跳转。

```js
location.href = `${location.protocol}//${location.host}/page/b`;
```

在该问题的查阅过程中，得知 hash 模式也会有这样的问题，以及需要使用到 URL 的调用（如微信分享）也需要注意该问题。
