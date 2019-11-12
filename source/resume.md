---
title: 简历
date: 2019-11-10 22:31:53
comments: false
---

<!-- https://github.com/geekcompany/ResumeSample/blob/master/web.md -->

# 联系方式

- 姓名：戴\*\*
- 手机：177\*\*\*\*\*732
- Email：<defeng_mail@163.com>
- QQ / 微信号：1437931235 / defenghznu

# 个人信息

- 男 / 1996-10
- 本科 / 杭州师范大学计算机科学与技术 / 2014.09 ~ 2018.06
- 工作年限：2 年
- 个人博客：<https://daief.tech>
- Github：<https://github.com/daief>
- 期望职位：Web 前端工程师
- 现居城市：杭州市

# 工作经历

## 杭州惠借科技有限公司（ 2018-01 ~ 至今 ）

### 前端标准统一

描述：此前，前端开发比较自由，没有完善的组件库、统一框架，久而久之导致了整体比较混乱的情形。针对前端现有问题的统一解决措施。

职责：参与问题的整合，主导前端公用库的设计与开发，同时维护良好的说明、使用文档以及变更日志。所有模块以 npm 模块形式开发，托管于私仓。

- 统一中后台技术选型为 Next.js 预渲染的模式
- 推进 Vue、统一前台页面技术选型为 Nuxt.js 预渲染的模式
- 工具类库的整合，如：友好、统一的与原生交互模块，内部请求相关的模块
- 中后台 React 组件封装
- Vue 组件封装
- 开发辅助工具的编写

### 统一登录后台

描述：这是一个相对系统的工程，对各种内部后台能有统一的用户、权限管理。

职责：前后端分离，负责前端部分的技术选型及开发，所用技术栈为 Next.js、Ant Design、GraphQL。期间遇到不少问题，最终采取了最优解进行实行，现已对接多个后台，且后台开发具有统一技术方案。

初期企图实行 SSR 同构方案，硬着头皮开始 Node.js 服务端方向的编写，调研试用了 Next.js + Fastify + GraphQL，在 Java 后端 JWT 的基础上，由 Node.js 中间层通过 cookie 实现了单点登录的功能。

中期，经过考虑：

- 添加了 Node.js 中间层、GraphQL 增加了整体前端开发人员的难度
- 实现 GraphQL 服务需要在 Node.js 中间层由前端人员与 Java 服务提供的 RESTful API 一一对接，极大增大了工作量以及维护成本

这样的产出比在当前场景会比较低，最终确定了简化版的方案，能够用上新技术、开发更友好同时能提升体验：

- 依旧使用 Next.js，但不以 SSR 形式部署，只做页面的静态预渲染，带来首屏加载的优化。同时，要求开发者有同构的意识、了解 SSR 的基本原理
- 仅在前端范畴使用 GraphQL，使用 GraphQL 的语法、概念、工具在前端（客户端）做到 GraphQL 带来的字段查询、接口聚合等功能

### 移动端 APP 内页面 & 活动页

描述：涉及各种内嵌在 APP 内的页面以及活动页的开发。

职责：理解 PRD 需求，还原设计稿页面，做到常规浏览器环境的适配。

- 期间开始学习 React 并进行实际运用，熟练进行页面编写
- 频繁涉及 Web 与原生交互的内容，熟悉常规调试方法
- 期间了解到 TypeScript 并进行学习，后在公司内推广成功、熟练使用
- 加深对 Webpack 的学习，能够自定义常规的配置
- 了解到 Nginx、Jenkins 的存在，能协助运维进行相关问题的处理

## 杭州和乐科技有限公司（ 2017-06 ~ 2018-01 ）

### 母子健康手册 - pdf

[在线地址](http://muzi.heletech.cn:3003/mz/mz-health-hz/read-pdf/html/ReadHandbook/read-handbook.html)

描述：这是一个在线版的母子健康手册，记录了宝宝诞生前至六岁、母子间爱的记录。

职责：这是一个前后端分离的项目，我负责前端部分的内容开发，使用 jQuery 完成界面展示与交互。期间所遇到的关键问题 & 解决：

- 初始化数据时多个接口请求的处理。使用 `$.when`、`$.Deferred` 处理接口请求串行、并行的关系，初步接触 Promise 的概念。
- 整本手册有 130+ 页，图片加载的问题。预请求的思想，以如下顺序发起图片的请求 `当前页` > `后两页` > `前两页`，增强用户的翻页体验；同时释放内存中范围之外的图片缓存，避免内存爆炸。
- 二次访问，图片加载的问题。图片第一次下载后，转换为 base64，通过 `IndexedDB` 来持久化存储。二次访问时，先尝试从 `IndexedDB` 获取再发起网络请求，加强用户二次访问体验的同时能节约不少流量。

### 小乐机器人

描述：比较简单的一个表单提交、结果展示页面。

职责：在学习了 Vue 之后，初次主张进行技术栈的更新，第一次在 Vue 的基础上完成页面的编写。

- 由此接触到现代编程的方式，了解到 Node.js、npm、Webpack、MVVM 等概念。

# 个人作品

- [jugg](https://github.com/daief/jugg)：前端脚手架工具，基于 Webpack 编写，内置常用的 Webpack 配置集合，方便前端项目的开发、构建。
- [vue-music](https://github.com/daief/vue-music)：基于 Vue 的个人练习项目，根据网易云音乐 PC 页面进行仿造。
- 组件类：
  - [rc-if](https://github.com/daief/rc-if)：React 简单组件，实现 Vue 中与 `v-if`、`v-else` 相似的行为。
  - [toast](https://github.com/daief/axew-toast)：简单泛用的 toast 组件。
- 扩展类：
  - [inject-code](https://github.com/daief/inject-code)：Chrome 扩展程序，可通过该插件往匹配的页面中注入 JS 脚本或 CSS 样式文件。
  - [espf](https://github.com/daief/espf)：Electron 应用程序，读取系统中 `.bash_profile`、`.zshrc` 等文件，方便对这类文件的编辑。

# 技能清单

- 熟悉 TypeScript、JavaScript / ES6+ 规范 / 偏爱 TS
- 熟悉 React、Vue / React 使用更多 / 具备一定的组件开发能力
- 熟悉 npm、Webpack、Git 等工具的使用
- 熟悉 Chrome DevTools、Charles 的使用
- 能使用 Node.js 编写脚本工具、命令行工具
- 熟悉 HTML、CSS
- 了解常用 Linux 命令
- 了解 Jenkins、Nginx 的配置及使用
