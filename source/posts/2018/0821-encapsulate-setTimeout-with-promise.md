---
title: 使用promise封装setTimeout
description: 用 Promise 封装 setTimeout，实现可链式调用、可取消或延迟执行的异步工具函数。
date: 2018-08-21 22:17:59
id: encapsulate-setTimeout-with-promise
categories: ["前端","JavaScript"]
tags:
  - JavaScript
  - Promise
keywords:
---

使用 Promise 对 setTimeout 进行封装，从而支持链式的调用。

```javascript
const delay = (func, millisec, options) => {
  let timer = 0
  let reject = null
  const promise = new Promise((resolve, _reject) => {
    reject = _reject
    timer = setTimeout(() => {
      resolve(func(options))
    }, millisec)
  })

  return {
    get promise() {
      return promise
    },
    cancel() {
      if (timer) {
        clearTimeout(timer)
        timer = 0
        reject(new Error('timer is cancelled'))
        reject = null
      }
    },
  }
}
```

使用🌰：
```javascript
const d = delay(({a, b}) => {
  console.log(a, b)
  return a + b
}, 2000, {a: 1, b: 3})

d.promise.then((result) => {
  console.log('result', result)
}).catch((err) => {
  console.log(err)
})

// cancel
// setTimeout(() => {
//   d.cancel()
// }, 1000)
```
