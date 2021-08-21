---
title: 在博客中添加卡片式链接
date: 2021-08-21 14:27:25
id: blog-link-card
categories: ['前端']
tags:
  - Blog
keywords:
  - 博客链接卡片
description:
---

最近升级了的企业微信，发现发送链接信息的时候，企信会自动拉取链接的标题、描述和图片信息，并组合成卡片的形式进行展示，给人的感觉就很棒，既传递了更多的信息，又显得美观，就想着在博客里也加上这个功能。

效果是下面这样的，如果展示的还是链接，那可能是还没加载出来或者背后的服务挂了（白嫖不易）：[Github](https://github.com 'data-layout=card')

截图效果如下：

![卡片截图](imgs/blog-link-card.png 'width=390')

<!-- more -->

## 实现

实现思路其实很简单，请求目标 url 的文本内容（HTML），接着在前端解析 HTML 标签内容，提取出标题、描述和图片，最后将超链接转换成卡片的样式。

期间主要考虑的问题有两点：

- 如何解决前端发起请求时的跨域问题
- 如何使用 markdown 语法来表达卡片链接，并且不要破坏 markdown 的语法（原本用 hexo 里面就会有一些特定方言，尽量避免，以后迁移也不会有什么问题）

第一个问题没法以纯前端的方式去解决了，最直接同时最简单的方式就是搭建一个允许跨域的代理服务器，但上服务器是不可能上的，于是谷歌一搜，真有免费的跨域代理（又赚了一个亿），确认了下不会被墙，那么先用了再说：[allOrigins](https://allorigins.win/ 'data-layout=card')

接着关于第二个问题，观察标准的 markdown 语法是支持书写 href、text 和 title，href 是功能性的，text 是直接会展示的，只能在 title 上做手脚，我的想法就是将 title 的定义改了，支持直接写 url query 键值对的方式，这样一来就能输入更多的配置项：

```md
[Github](https://github.com 'class=red&target=_blank&data-layout=card')
```

可以约定配置了 `data-layout=card` 的超链接就将其转换成卡片。

解法都有了就可以实现了，就是请求 HTML 文本解析内容，而内容提取的逻辑可以做得细节一点，比如可以定义三种信息的解析优先级：

- title：页面 title => meta 中的 og:title 字段 => markdown 中的 text
- description：meta 中的 description 字段 => meta 中的 og:description 字段 => 原始 href
- image：meta 中的 image 字段 => meta 中的 og:image 字段 => 页面中第一个 img 标签的 src => 网站 icon => 默认图片

最后可以再考虑展示时的优化，比如因为是前端逻辑，每次都会触发页面的请求，可以像图片一样做个懒加载，当超链接滚动到视口内再执行转换逻辑。

## 结语

内容比较简单，但提升的体验还是不少的，开始愉快地使用起来吧。

在这里要感谢各大厂商和大佬提供的免费服务，感谢他们让我以白嫖的姿态享受到了各种服务。
