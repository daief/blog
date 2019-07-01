---
title: Node.js 学习搭建
date: 2017-10-04
id: learn-nodejs
categories: ["Node.js"]
tags:
  - JavaScript
  - Node.js
description:
---

听说 Node.js 是开启 JavaScript 后端开发之旅的技术，学习一下服务器的搭建过程。

<!-- more -->

### 安装 Node 环境

前往[Node.js 官网](http://nodejs.cn/download/)进行下载安装。

安装完成后，终端识别`node`命令：

```bash
C:\Users\Administrator>node -v
v8.1.2
```

#### npm

安装完 Node 之后会同时安装`npm`，`npm`是 Node.js 的包管理工具（package manager）。

> 为啥我们需要一个包管理工具呢？因为我们在 Node.js 上开发时，会用到很多别人写的 JavaScript 代码。如果我们要使用别人写的某个包，每次都根据名称搜索一下官方网站，下载代码，解压，再使用，非常繁琐。于是一个集中管理的工具应运而生：大家都把自己开发的模块打包后放到 npm 官网上，如果要使用，直接通过 npm 安装就可以直接用，不用管代码存在哪，应该从哪下载。
> 更重要的是，如果我们要使用模块 A，而模块 A 又依赖于模块 B，模块 B 又依赖于模块 X 和模块 Y，npm 可以根据依赖关系，把所有依赖的包都下载下来并管理起来。否则，靠我们自己手动管理，肯定既麻烦又容易出错。

npm 常用命令：

```bash
npm -v  # 查看npm版本
npm help # 查看帮助
npm init # 引导创建package.json文件。
npm install # 安装package.json文件已保存的包
npm install <包名称> # 在本地安装包
npm install <包名称> -g # 在全局安装包
# 安装的同时将信息写入package.json文件中的dependencies
npm install <包名称> --save
# 安装的同时将信息写入package.json文件的devDependencies
npm install <包名称> --save-dev
npm uninstall <包名称> # 卸载本地包
npm uninstall <包名称> -g # 卸载全局包
# 卸载的同时将信息从package.json文件中的dependencies移除
npm uninstall <包名称> -save
# 卸载的同时将信息从package.json文件中的devDependencies移除
npm uninstall <包名称> -save-dev
npm list # 查看本地所有包
npm list -g # 查看全局所有包
npm root # 查看本地包安装路径
npm root -g # 查看全局包安装路径
npm outdated # 查看本地过期包
npm outdated -g # 查看全局过期包
npm update # 升级本地所有过期包
npm update -g # 升级全局所有过期包
npm update <包名称> # 升级本地包
npm update <包名称> -g # 升级全局包
```

### 创建 Node 项目

新建空目录`node`

进入后在当前目录打开终端，使用`npm init`初始化：

```bash
npm init

# 根据提示进行填写

# 然后生成一个 package.json

```

新建`app.js`：

```javascript
console.log("hello world");
```

最后终端里运行可以看到：

```bash
C:\Users\Administrator\Desktop\node>node app.js
hello world
```

### 创建一个 Web 服务器

Node.js 应用是由哪几部分组成的：

1. 引入 required 模块：我们可以使用 require 指令来载入 Node.js 模块。
2. 创建服务器：服务器可以监听客户端的请求，类似于 Apache 、Nginx 等 HTTP 服务器。
3. 接收请求与响应请求 服务器很容易创建，客户端可以使用浏览器或终端发送 HTTP 请求，服务器接收请求后返回响应数据。

#### 使用`http`模块监听端口、创建服务

编辑`app.js`:

```javascript
var http = require("http");

http
  .createServer(function(request, response) {
    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain;charset=utf-8
    response.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });

    response.write("Hello World");

    response.end();
  })
  .listen(8888);

// 第一行请求（require）Node.js 自带的 http模块，并且把它赋值给 http 变量。
// 接下来我们调用 http 模块提供的函数： createServer 。这个函数会返回
// 一个对象，这个对象有一个叫做 listen 的方法
// listen 方法有一个数值参数，指定这个 HTTP 服务器监听的端口号。
```

`node app.js`运行后，浏览器访问`http://127.0.0.1:8888/`可以看到`hello world`

#### 引入`fs`模块读写文件

因为是单线程运行的，为了不因为读写操作造成阻塞，一般使用异步的方式。

修改 app.js：

```javascript
var http = require("http");
// 引入 fs 模块并赋值给变量 fs
var fs = require("fs");

http
  .createServer(function(request, response) {
    // 发送 HTTP 头部
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain;charset=utf-8
    response.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });

    // 读取文件，异步执行。同步：var data = fs.readFileSync('input.txt');
    fs.readFile("file/1.txt", function(err, data) {
      // 回调函数
      if (err) {
        console.log(err);
        // 读取失败发回响应信息
        response.end("文件读取失败");
        return;
      }
      // 发回文件内容
      response.end(data.toString());
    });
  })
  .listen(8888);

// 第一行请求（require）Node.js 自带的 http模块，并且把它赋值给 http 变量。
// 接下来我们调用 http 模块提供的函数： createServer 。这个函数会返回
// 一个对象，这个对象有一个叫做 listen 的方法
// listen 方法有一个数值参数，指定这个 HTTP 服务器监听的端口号。
```

`node app.js`运行后，浏览器访问`http://127.0.0.1:8888/`可以看到`文件读取失败`，并能在终端看到错误信息。创建`file/1.txt`：

```text
hello node.js

javascript
```

重新访问`http://127.0.0.1:8888/`可看到上述信息。

### 使用中间件`express`搭建服务

编辑`app.js`：

```javascript
// 引入中间件
var express = require("express");

var app = express();

// 注册路由'/'
app.get("/", function(req, res) {
  res.send("Hello World");
});

// 监听端口
app.listen(8888, function() {
  console.log("run@", 8888);
});
```

重新运行`node app.js`，终端会报错提示找不到`express`模块，这时候就需要用`npm`安装模块：

```bash
npm install express --save

+ express@4.16.2
added 48 packages in 28.21s
```

完成之后会发现多了一个`node_modules`，专门用于存放模块，打开`package.json`，会发现多了一条`dependencies`信息，随着模块的增多，`dependencies`的内容也会变多：

```json
{
  "name": "node",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.16.2"
  }
}
```

这时候重新运行并访问`http://127.0.0.1:8888/`，可看到`Hello World`，试着访问`http://127.0.0.1:8888/index.html`则是`Cannot GET /index.html`。

### 设置静态资源目录

编辑`app.js`加入`app.use(express.static('public'))`：

```javascript
// 引入中间件
var express = require("express");

var app = express();

// 设置public目录作为静态资源，可以直接通过url进行访问
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.send("Hello GET");
});

app.listen(8888, function() {
  console.log("run@", 8888);
});
```

创建`public`目录，在其中放入一些 html、图片或文件，通过`http://127.0.0.1:8888/index.html`、`http://127.0.0.1:8888/images/avatar.png`……访问。

```bash
public
  │  index.html
  │
  └─images
    avatar.png
    yoki1.jpg
    yoki2.png
```

### 使用 ejs 模板

安装 ejs：

```npm
npm i ejs --save
```

创建`views`目录，并在其中创建 hello.ejs：

```ejs
<div>
  姓名: <%=name%>
</div>
```

引入、使用，编辑`app.js`：

```javascript
// 引入中间件
var express = require("express");
// 引入ejs
var ejs = require("ejs");
var app = express();

// 设置public目录作为静态资源，可以直接通过url进行访问
app.use(express.static("public"));

// 将模版引擎设置为 ejs
app.set("view engine", "ejs");

// 将 app.set('view engine', 'ejs'); 换成下面两句之后
// 模板不再以.ejs结尾，改为.html
// 如./views下的 index.ejs 改为 index.html
// app.engine('.html',ejs.__express);
// app.set('view engine', 'html');

app.get("/", function(req, res) {
  res.send("Hello GET");
});

app.get("/hello", function(req, res) {
  // 修改响应信息
  // 渲染 hello.ejs
  // 读取 ./views/hello.ejs文件的内容，然后将其中的name变量替换为test,例如<%=name%>会变为张三
  res.render("hello", { name: "张三" });
});

app.listen(8888, function() {
  console.log("run@", 8888);
});
```

重新运行、访问`http://127.0.0.1:8888/hello`，可看到`姓名：张三`。

### 路由

创建`router`目录，创建`user.js`，当前目录结构：

```bash
├─file
├─node_modules
├─public
│  └─images
├─router
└─views
```

在`app.js`中添加：

```javascript
// ===========在app中注册路由===========
app.use("/user", require("./router/user"));
```

编辑`user.js`：

```javascript
var express = require("express");
var router = express.Router();

var users = [
  { id: 1, name: "张三" },
  { id: 2, name: "李四" },
  { id: 3, name: "王五" }
];

// 统一设置 head 信息
router.all("*", function(req, res, next) {
  // 跨域请求时是否携带cookie
  res.header("Access-Control-Allow-Credentials", true);
  // 允许跨域
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("Content-Type", "application/json;charset=utf-8");
  // 调用next
  next();
});

// app.js中是在 /user 后引用的，所以 /user/id/1 才能进行匹配

//定义一个get请求
router.get("/id/:id", function(req, res, next) {
  var queryid = req.params.id || 0;

  var user = {};

  for (let i = 0; i < users.length; i++) {
    if (queryid == users[i].id) {
      // 返回信息
      user = users[i];
    }
  }
  // 返回信息
  res.send(JSON.stringify(user));
});

// post请求
router.post("/id", function(req, res, next) {
  // req.param(“id”) 已舍弃
  var queryid = req.body.id || 0;

  var user = {};

  for (let i = 0; i < users.length; i++) {
    if (queryid == users[i].id) {
      // 返回信息
      user = users[i];
    }
  }
  // 返回信息
  res.send(JSON.stringify(user));
});

router.get("/all", function(req, res, next) {
  // 返回用户列表
  res.send(JSON.stringify(users));
});

// 导出模块，以供require
module.exports = router;
```

重新运行后，访问（要加上/user）`http://127.0.0.1:8888/user/all`、`http://127.0.0.1:8888/user/id/1`可看到对应信息，但是使用 post 请求`http://127.0.0.1:8888/user/id`时控制台会发出错误，要解析 post 请求的 body 还需要引入中间件。

在`app.js`中加入：

```javascript
// 通常使用body-parser进行post参数的解析,不添加该项依赖，req.body为undefined
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
```

然后就可以正常解析 post 请求。

### 连接 mysql 数据库

`npm`安装 `mysql`：

```bash
npm i mysql --save

```

#### 基本使用

新建 `mysql.js`：

```javascript
// 引入模块
var mysql = require("mysql");

// 基本使用
var connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root", // 数据库连接用户名
  password: "123456", // 连接密码
  database: "test_db" // 连接数据库
});

connection.connect();

//查询
connection.query("select * from `admin`", function(err, rows, fields) {
  if (err) throw err;
  console.log("查询结果为: ", rows, fields);
});
//关闭连接
connection.end();
```

运行`node mysql.js`查看结果。

#### 使用连接池

编辑`mysql.js`：

```javascript
var mysql = require("mysql");

// 连接池，默认10个连接数
var pool = mysql.createPool({
  host: "localhost",
  port: "3306",
  user: "root", // 数据库连接用户名
  password: "123456", // 连接密码
  database: "test_db", // 连接数据库
  multipleStatements: true
});

var query = function({ sql, obj, success, fail }) {
  obj = obj || "";
  pool.getConnection(function(err, conn) {
    if (err) {
      // 失败回调
      fail(err);
    } else {
      // sql，obj 预编译，后面可以看到
      conn.query(sql, obj, function(qerr, vals, fields) {
        // 释放连接
        conn.release();
        // 成功回调
        success(qerr, vals, fields);
      });
    }
  });
};

// 导出模块
module.exports = query;
```

编辑`user.js`：

```javascript
// 引入
var query = require("../mysql");

// 修改 get 请求的控制器
router.get("/id/:id", function(req, res, next) {
  var queryid = req.params.id || 0;

  var user = {};

  query({
    // sql 预编译
    sql: "select * from `user` where id = ?",
    obj: queryid,
    success: (err, vals, fields) => {
      res.send(JSON.stringify(vals));
    },
    fail: err => {
      res.send(JSON.stringify([]));
    }
  });
});
```

重新运行、访问`http://localhost:8888/user/id/1`（前提创建好相应数据库表结构）。

### log4js 日志使用

安装模块：

```bash
npm i log4js --save
```

log4js 配置说明（还不是很清楚，简单按照官方配置）：

```javascript
{
  "appenders": {
    "everything": {
      // 文件日志
      "type": "file",
      // 文件名：logs/all-the-logs.log
      "filename": "logs/all-the-logs.log"
    },
    "emergencies": {
      // 文件日志
      "type": "file",
      // 文件名：logs/oh-no-not-again.log
      "filename": "logs/oh-no-not-again.log"
    },
    "just-errors": {
      "type": "logLevelFilter",
      // emergencies 只记录error级日志，
      // 即 logs/oh-no-not-again.log 中记录错误日志
      "appender": "emergencies",
      "level": "error"
    }
  },
  "categories": {
    "default": {
      "appenders": [
        "just-errors",
        "everything"
      ],
      "level": "debug"
    }
  }
}
```

把 log4js 配置写在 `config/log4js.json` 中（注意 json 中不能有注释）。

`app.js`中引入 `log4js`：

```javascript
// add log4js
var log4js = require("log4js");

// 使用 config/log4js.json 的配置
log4js.configure("./config/log4js.json");
// 页面请求日志, level用auto时
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: "auto" }));
```

创建`log`目录，再重新运行，可以看到`log`目录下生成了两个日志文件。访问链接后发现日志中的内容会自动记录。

主动打印日志，在`router/user.js`中：

```javascript
// 引入log4js
var logger = require("log4js").getLogger("user");

// 然后使用 logger 可进行日志记录
logger.debug("Some debug handle");

logger.error("some error");
```

### 结束

至此，一个小型、全面的服务器就搭建完成了。但是，现在每个方面只是了解性地接触了，日后如果要使用的话，必定是要再深入的。总之，先是对 Node.js 的使用有了初步的认识了。
