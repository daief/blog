---
title: 简历
date: 2024-02-21 21:13:04
comments: false
---

<!--
- https://github.com/geekcompany/ResumeSample/blob/master/web.md
-->

# 联系方式

- 姓名：戴\*\*
- 手机：177\*\*\*\*\*732
- Email：<defeng_mail@163.com>
- 微信号：[defenghznu](https://daief.tech/images/wechat.jpg)

# 个人信息

- 男 / 1996.10
- 本科 / 杭州师范大学 / 计算机科学与技术 / 2014.09-2018.06
- 个人博客：[https://daief.tech](https://daief.tech 'data-layout=card')
- Github：[https://github.com/daief](https://github.com/daief 'data-layout=card')
- 期望职位：前端开发工程师

# 技能清单

- 掌握 `HTML`、`CSS`、`JavaScript` 以及 `TypeScript`
- 掌握 `React` 及其生态，并了解其原理
- 熟悉 `Vue`，有实际开发经验
- 熟悉 `Electron` 的开发，了解框架原理
- 熟悉微信小程序，有实际基于 `Taro` 的开发经验
- 熟悉 `Webpack`、`Rollup` 等常用构建工具
- 熟悉 `Hybrid` 开发模式
- 有 `Serverless` 项目的开发经验
- 熟悉敏捷开发，担任 `Scrum Master`

# 工作经历

### 杭州群核信息技术有限公司（2020.06-至今）- 前端 TO

- 用户增长前端 TO，负责酷家乐 PC 客户端和主站业务
- 设计圈、展示馆业务前端负责人，负责小程序系统设计，负责前后台系统的开发和维护
- 获得两次研发季度之星奖项

### 杭州惠借科技有限公司（2018.01-2020.05）- 前端工程师

- 从 0 到 1 制定、沉淀前端基建，推动公司技术栈的更新和发展

### 杭州和乐科技有限公司（2017.06-2018.01）- 前端实习

- 负责移动端 Web 页面开发；引入 Vue 框架和前端工程化模式，取代原始的开发模式

# 项目经历

## 酷家乐 PC 客户端（2022.04-至今）

> 酷家乐客户端是酷家乐的重要产品终端，承载了绝大部分的业务和 60%+ 的用户活跃。

- 职责：技术负责人
- 技术栈：`Electron`、`React`、`TypeScript`

背景：

- 客户端项目维护年限长，代码组织差维护难度高，多业务复用灵活性低
- 客户端内核版本落后，特性缺失、对 3D 工具的支持不友好
- IPC 调用混乱，存在性能安全问题
- 更新机制不完善，新版本覆盖周期长
- 监控手段弱，缺少对客户端运行时的把控

行动 & 结果：

- 发起主进程整体重构，引入依赖注入模式，单测覆盖达到 `90%+`，启动内存减少 `200M`、启动速度提升 `300ms`，重构计划让我获得 `2023Q4 最佳代码质量`奖项
- 成功完成 2 次内核升级，最大跨度从 `v11` 到 `v20`，新版内核的发布还带来了 `3‰` 的崩溃率改善
- 渲染进程下文隔离，所有 IPC 接口只允许异步调用、通过 `contextBridge` 暴露，取代 `require` 的方式，提升调用性能（页面初始化减少 `80ms` 同步阻塞）和安全性
- 客户端系统分层设计：`基座层` + `业务层`，`业务层` 独立更新、不依赖整体发版；二方业务基于 `基座` 快速开发产出新的客户端
- 协同监控平台产出 `Electron` 监控 SDK；与 3D 工具组持续进行崩溃治理，改善了 `1.5‰` 的崩溃率；基于 `egui` 产出独立小工具，用于用户、客服快速解决常见问题

## 设计圈小程序（2020.06-2022.04）

> 设计圈是一款面向商家的设计师培育解决方案，同时可用于私域流量推广和留资，产品形态包括 Web 前后台和小程序。

- 职责：前端负责人
- 主要技术栈：`Taro2`、`TypeScript`

背景：

- 业务涉及小程序和 Web 的多端开发，近似逻辑重复开发，效率低、不优雅
- 期间吸收了一个“展示馆”业务，业务上需要复用页面级的功能模块，直接复制粘贴实现，易出错、后续难维护
- 小程序功能多，体积限制问题出现
- 小程序限制多，开发受限

行动：落地 `Git Subtree` 的复用形式，推进跨端编码规范；发起小程序源码合并，推动两个业务核心逻辑的整合，通过 `extPages` 分发多小程序；踢除冗余、页面转 Web；实现小程序生命周期扩展，增加统一的链接解析层

结果：

- 复用能力完善，提升 `0.5` 左右人效，产出跨端沉淀
- 分发上线 `20+` 商家小程序 <!-- 后端实现无需跨多服务开发；产品逻辑上只需专注一个核心，只需终端表现做区分 -->
- 主包体积缓解 `300K+`，页面 Web 化享受更大的生态、开发效率更高 <!-- 如复杂表单 -->
- 小程序开发形成统一规范，能力限制“解除”或被绕过 <!-- 生命周期、太阳码统一序列化和解析、TabBar 内容数量动态、跳转带参 -->

<!-- 评论组件（10+ 业务接入）、浏览器插件、图片上传云端压缩、React 基座、 -->

## 基础建设（2019.07-2020.06）

背景：技术栈使用混乱，编码自由无章法，复用纯靠拷贝无文档，整体建设落后

行动：负责技术选型，定制脚手架；归纳总结，重新设计基础库 API 及实现、封装组件，推广单元测试

结果：

- 引入 `Workspace` 项目安装提速 `30%+`
- 引入 `TypeScript` 作为第一语言，类型校验和优秀的代码提示得到团队一致肯定
- 产出脚手架，支持 0 配置启动新项目，累计服务 `10+` 项目；
- 产出原生 bridge 的封装库，使用队列解决历史设计缺陷造成的数据竞态问题

# 个人作品

- [gugu](https://github.com/daief/blog/tree/master/packages/gugu)：一个简单的博客引擎
- [chip8](https://daief.tech/chip8/?source=wasm)：一个有趣的 `chip8` 模拟器，分别使用 `Rust` 和 `JavaScript` 实现
- [daisyui-vue](https://github.com/daief/daisyui-vue)：一个进行中的 `Vue` 组件库

# 致谢

感谢您花时间阅读我的简历，期待能有机会和您共事。
