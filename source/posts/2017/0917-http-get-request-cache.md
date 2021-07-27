---
title: ajax请求缓存
date: 2017-9-17 19:41:45
id: http-get-request-cache
categories: "前端"
keywords:
  - ajax-get
  - cache
description:
---

浏览器的 GET 请求默认会有缓存，包括 ajax 的 GET 请求。

如果两次请求的 url 相同的话，浏览器（不同缓存机制的浏览器会有所不同）会直接读取缓存里第一次请求的结果给第二次请求。

缓存要缓存的好处，但有时我们并不需要 ajax 的请求被缓存。解决方式很简单只需更改请求的 url 即可，常用的就是加上时间戳，如下：

```js
ajax(`https://example.com?t=${Date.now()}`)
```
