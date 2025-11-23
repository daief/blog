---
title: 迁移到 Rspack 的实践记录
id: migrate-to-rspack
date: 2025-11-22 21:58:16
tags:
  - Rspack
description:
draft: true
---

过去一段时间给一些前端项目做了改造，把构建器从 Webpack4/5 迁移到了 [Rspack](https://rspack.rs/)，大部分项目迁移完后，都减少了 **50%** 以上的构建时间，整体改善还是可观的。

选择 Rspack 另一方面的原因是它和 Webpack 兼容性较好，迁移成本相对较低，目前是一个非常推荐去尝试的构建器。但是，迁移过程中还是有遇到一些问题，本文进行一个记录和分享。

<!-- more -->

## Babel 迁移到 SWC

Rspack 内置了 [SWC](https://swc.rs/) 作为默认的 JS/TS 转译器，理想状态下应该要直接替换掉 Babel，这是对构建速度影响最大的环节之一。

而能否顺利地完全迁移到 SWC，实际上取决于 SWC 的生态给不给力。不幸的是，当前生态并没能直接让我完全从 Babel 转向 SWC。

### proposal 系列插件

比如 `@babel/plugin-proposal-object-rest-spread`，我的选择是舍弃这些，毕竟大部分已经是语言标准了，直接依托 SWC 所覆盖到的语法即可。不建议去使用太新、不稳定的语法特性。

### [babel-plugin-jsx-control-statements](https://www.npmjs.com/package/babel-plugin-jsx-control-statements)

可以使用 SWC 版本的 [swc-plugin-jsx-control-statements](https://github.com/intpp/swc-plugin-jsx-control-statements)，**但是**，Rspack 中会有一种避免作用域冲突的机制，会自动对变量进行重命名，导致这个 SWC 插件的 `For` 标签在 Rspack 中表现异常，具体如下：

```jsx
// input.js
<For each="item" index="i" of={list}>
  <div>{item.xxx}</div>
</For>;

// output.js
list.map(function (item1 /* ❌ 这里期望的 item 被重命名成了 item1 */) {
  return item.xxx; // 导致这里出现 Cannot read properties of undefined (reading xxx)
});
```

目前打了一个补丁来解决，但未能覆盖所有场景，详见 [PR#9](https://github.com/intpp/swc-plugin-jsx-control-statements/pull/9)。在原作者未接受前，我发布了一个临时版本的包 [@axew/swc-plugin-jsx-control-statements](https://www.npmjs.com/package/@axew/swc-plugin-jsx-control-statements)。
