---
title: 简历
date: 2019-11-10 22:31:53
comments: false
---

## 联系方式

- 姓名：戴\*\*
- 手机：177**\***732
- Email：<defeng_mail@163.com>
- QQ / 微信号：1437931235 / defenghznu

## 个人信息

- 男 / 1996-10
- 本科 / 杭州师范大学计算机科学与技术 / 2014.09 ~ 2018.06
- 工作年限：2 年
- 个人博客：<https://daief.tech>
- Github：<https://github.com/daief>
- 期望职位：Web 前端工程师
- 现居城市：杭州市

## 工作经历

### 杭州惠借科技有限公司（ 2018-01 ~ 至今 ）

### 杭州和乐科技有限公司（ 2017-06 ~ 2018-01 ）

#### 母子健康手册 - pdf

[在线地址](http://muzi.heletech.cn:3003/mz/mz-health-hz/read-pdf/html/ReadHandbook/read-handbook.html)

描述：这是一个在线版的母子健康手册，记录了宝宝诞生前至六岁、母子间爱的记录。

职责：这是一个前后端分离的项目，我负责前端部分的内容开发，使用 jQuery 完成界面展示与交互。期间所遇到的关键问题 & 解决：

- 初始化数据时多个接口请求的处理。使用 `$.when`、`$.Deferred` 处理接口请求串行、并行的关系，初步接触 Promise 的概念。
- 整本手册有 130+ 页，图片加载的问题。预请求的思想，以如下顺序发起图片的请求 `当前页` > `后两页` > `前两页`，增强用户的翻页体验；同时释放内存中范围之外的图片缓存，避免内存爆炸。
- 二次访问，图片加载的问题。图片第一次下载后，转换为 base64，通过 `IndexedDB` 来持久化存储。二次访问时，先尝试从 `IndexedDB` 获取再发起网络请求，加强用户二次访问体验的同时能节约不少流量。

#### 小乐机器人

<!-- TODO -->
第一个 vue 项目

## 个人作品

- [jugg](https://github.com/daief/jugg)：前端脚手架工具，基于 Webpack 编写，内置常用的 Webpack 配置集合，方便前端项目的开发、构建。
- [vue-music](https://github.com/daief/vue-music)：基于 Vue 的个人练习项目，根据网易云音乐 PC 页面进行仿造。
- 组件类：
  - [rc-if](https://github.com/daief/rc-if)：React 简单组件，实现 Vue 中与 `v-if`、`v-else` 相似的行为。
  - [toast](https://github.com/daief/axew-toast)：简单泛用的 toast 组件。
- 扩展类：
  - [inject-code](https://github.com/daief/inject-code)：Chrome 扩展程序，可通过该插件往匹配的页面中注入 JS 脚本或 CSS 样式文件。
  - [espf](https://github.com/daief/espf)：Electron 应用程序，读取系统中 `.bash_profile`、`.zshrc` 等文件，方便对这类文件的编辑。

## 技能清单

- 熟悉 TypeScript、JavaScript / ES6+ 规范 / 偏爱 TS
- 熟悉 React、Vue / React 使用更多 / 具备一定的组件开发能力
- 熟悉 npm、Webpack、Git 等工具的使用
- 熟悉 Chrome DevTools、Charles 的使用
- 能使用 Node.js 编写脚本工具、命令行工具
- 熟悉 HTML、CSS
- 了解常用 Linux 命令
- 了解 Jenkins、Nginx 的配置及使用

<!-- TODO https://github.com/geekcompany/ResumeSample/blob/master/web.md -->
