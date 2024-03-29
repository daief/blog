---
title: 将并发的异步操作转化为串行执行
date: 2018-09-25 22:46:20
id: transforming-concurrent-asynchronous-operations-into-serial-execution
categories: ["前端", "JavaScript"]
tags:
  - JavaScript
keywords:
  - async/await
  - Promise
---

情景还原：有一个用 Promise 封装的异步操作，用于 JS 与客户端交互以获取数据，但当出现并发调用获取数据的时候发现只有其中的一次操作有回调，而剩余的调用就像丢失了一样、后续的步骤（then）也得不到执行。实际上有多种解决方式，这里考虑将这些并发的调用转化为串行执行来确保每次的调用接收到回调。虽然感觉这样做可能意义不是很大，但感觉颇有意思。

<!-- more -->
---
直接上码：
```js
const Log = (...params) => console.log(...params)

// 异步方法
const getData = (...params) => new Promise(resolve => {
  setTimeout(() => {
    resolve(params)
  }, 500)
})


const stack = []
let isLock = false

const handler = async ({args, call}) => {
  stack.push({ call, args })

  if (isLock) { return }

  isLock = true
  while (stack.length) {
    const {call, args} = stack.shift()
    let err = null
    // 每次异步执行完毕再进行下一次
    const rs = await getData(...args).catch(e => (err = e))
    // 回调结果
    call(rs, err)
  }
  isLock = false
}

const operate = (...args) => {
  return new Promise((resolve, reject) => {
    handler({
      args,
      call: (rs, err) => {
        if (err) {
          reject(err)
        } else {
          resolve(rs)
        }
      },
    })
  })
}

// 并发执行比较
getData('a1', 'a11').then(r => Log(r, Date.now()))
getData('a2').then(r => Log(r, Date.now()))
getData('a3').then(r => Log(r, Date.now()))
getData('a4').then(r => Log(r, Date.now()))

operate('b1', 'b11').then(r => Log(r, Date.now()))
operate('b2').then(r => Log(r, Date.now()))
operate('b3').then(r => Log(r, Date.now()))
operate('b3').then(r => Log(r, Date.now()))

```

结果：
```bash
["a1", "a11"] 1540999894238
["a2"] 1540999894239
["a3"] 1540999894239
["a4"] 1540999894239

["b1", "b11"] 1540999894247
["b2"] 1540999894748
["b3"] 1540999895251
["b3"] 1540999895754
```

---

codepen：

<iframe height='312' scrolling='no' title='transforming concurrent asynchronous operations into serial execution' src='//codepen.io/daief/embed/bmPzwe/?height=312&theme-id=dark&default-tab=js' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='https://codepen.io/daief/pen/bmPzwe/'>transforming concurrent asynchronous operations into serial execution</a> by daief (<a href='https://codepen.io/daief'>@daief</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>
