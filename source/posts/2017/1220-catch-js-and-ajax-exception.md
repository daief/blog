---
title: 前端错误捕获以及ajax监听
id: catch-js-and-ajax-exception
date: 2017-12-20 20:44:10
categories: ["前端", "JavaScript"]
tags:
  - JavaScript
  - 前端日志
---

上线的项目难免会有错误，通过分析日志能够有效、准确地定位、重现并解决错误，从而提升产品体验。以下是根据资料以及目前需求所实现的一个前端日志采集的方案。

<!-- more -->

### 前端代码异常（错误）

1. 使用 js 的 `try { } catch (e) { }`：
  在可能出现错误的地方主动进行捕获，上传。

  ```javascript
  try {
    // 代码块
    var a = 1;
    a.a.a;
  } catch (e) {
    // 捕获的错误
    console.log(err);
    // TypeError: Cannot read property 'a' of undefined at test.html:33
    // 上报信息
    // ajax upload (err)
  }
  ```

  这种方式加上好的捕获处理，能够让程序不至于因为错误而崩溃。
  但是，需要包裹代码块，这点可以用一个入口函数来解决：

  ```javascript
  try {
    init();
  } catch (err) {
    // ajax upload (err)
  }
  ```

  即便如此也不能保证捕获所有错误：

  ```javascript
  function init() {
    //...
    $("button").click(function() {
      var a = 1;
      a.a.a;
    });
    //...
  }

  try {
    init();
  } catch (err) {
    // 此处不能捕获到错误
  }

  // 而是控制台报未捕获的错误：Uncaught TypeError: Cannot read property 'a' of undefined
  ```

  想要使用`try ... catch`捕获异步代码的错误，就要在代码执行的地方进行捕获：

  ```javascript
  function init() {
    //...
    $("button").click(function() {
      try {
        var a = 1;
        a.a.a;
      } catch (e) {
        // 捕获错误
      }
    });
    //...
  }

  init();
  ```

2. 通过`window.onerror`监听页面错误

  ```javascript
  /**
  * @param {String}  msg         错误信息
  * @param {String}  scripturl   出错脚本的url
  * @param {Long}    line        错误行号
  * @param {Long}    col         错误列号
  * @param {Object}  error       错误的详细信息
  */
  window.onerror = function(msg, scripturl, line, col, error) {
    // return true; 可屏蔽 console 报错显示，此处依旧选择显示
    // 跨域脚本的错误，捕获的结果是 Script error.
    // 可通过使用 crossorigin 信任
    if (msg == "Script error.") {
      return false;
    }

    // 采用异步的方式
    // 参考的使用异步的方式，避免阻塞，没遇见过也不想遇到
    setTimeout(function() {
      var data = {};
      data.scripturl = scripturl;
      data.line = line;
      // 不一定所有浏览器都支持col参数
      data.col = col || (window.event && window.event.errorCharacter) || 0;
      if (!!error && !!error.stack) {
        // 如果浏览器有堆栈信息
        // 直接使用
        data.msg = error.stack.toString();
      } else {
        // 参考资料中有通过 arguments.callee.caller 获取错误信息
        // 但是严格模式下不允许访问 arguments.callee
        // 故此处无法获取错误信息
        data.msg = "无法获取详细信息";
      }
      // 把 data 错误信息上报到后台
    }, 0);

    return false;
  };
  ```

  这种方式相对`try...catch`显得方便多了，能够实现全局监听错误，有一点要注意的是实现监听最好放在前面，以免因为错误导致 js 中断从而根本没有绑定上监听事件。

### 同时收集 ajax 信息，协助错误定位

通过重写`XMLHttpRequest`对象的`open`、`send`方法进行信息收集。

```javascript
var xhrArray = [];
var xhrlog = {
  // 记录请求的 url
  reqUrl: "",
  // 记录请求的方法
  reqMethod: "",
  // 保存原生的 open 方法
  xhrOpen: XMLHttpRequest.prototype.open,
  // 保存原生的 send 方法
  xhrSend: XMLHttpRequest.prototype.send,
  init: function() {
    var _self = this;

    // 重写 open
    XMLHttpRequest.prototype.open = function() {
      // 先在此处取得请求的url、method
      _self.reqUrl = arguments[1];
      _self.reqMethod = arguments[0];
      // 在调用原生 open 实现重写
      _self.xhrOpen.apply(this, arguments);
    };

    // 重写 send
    XMLHttpRequest.prototype.send = function() {
      // 记录xhr
      var xhrmsg = {
        url: _self.reqUrl,
        type: _self.reqMethod,
        // 此处可以取得 ajax 的请求参数
        data: arguments[0] || {}
      };

      this.addEventListener("readystatechange", function() {
        if (this.readyState === 4) {
          // 此处可以取得一些响应信息
          // 响应信息
          xhrmsg["res"] = this.response;
          xhrmsg["status"] = this.status;
          this.status >= 200 && this.status < 400
            ? (xhrmsg["level"] = "success")
            : (xhrmsg["level"] = "error");
          xhrArray.push(xhrmsg);
        }
      });

      _self.xhrSend.apply(this, arguments);
    };
  }
};

// 初始化，重写 xhr 方法
xhrlog.init();

// 至此，xhrArray 中就记录着当前页面的请求信息
```

至此，稍加修改、组合，就是一个简单而又实用的前端日志收集工具了，还是十分有意义的。

~~// 截止目前这份系统还没显露出威力，那，一定是因为我们的代码写的稳啊 (￣ ▽ ￣)／~~

### 参考资料

> [前端代码异常监控](http://rapheal.sinaapp.com/2014/11/06/javascript-error-monitor/)
> [:rocket: lajax - 前端日志解决方案](https://github.com/eshengsky/lajax)
> [前端代码异常日志收集与监控](https://www.cnblogs.com/hustskyking/p/fe-monitor.html)
> [JavaScript 错误处理](https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/001481157421687632cbe98b0094e96ba12c45c411f59ac000)
