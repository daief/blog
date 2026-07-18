---
title: 简单的前端脚手架
description: 使用 Node.js 交互、模板复制与配置替换，从零实现一个可生成初始项目的简单前端脚手架。
date: 2018-08-31 22:53:34
id: a-simple-cli
categories: ['前端', 'JavaScript']
tags:
  - JavaScript
  - Node.js
  - CLI
keywords:
---

从零搭建一个简单的脚手架工具，像`vue-cli`一样，一个命令就能变出一个完整结构的初始项目。流行的脚手架工具有很多实用的功能，这里要说的是最基本的一项：通过一个命令快速创建出初始项目。

<!-- more -->

## 简单的思路

1. 借助 Node.js 实现命令行的交互，读取使用者输入，可以做一些生成项目时的配置；
2. 复制预设的模板文件，根据用户输入做出一些配置，最后粘贴到指定位置。

## 初始化项目

创建空目录`simple-cli`并初始化：

```bash
$ mkdir simple-cli && cd simple-cli && yarn init -y
```

安装相关依赖：

1. [commander](https://github.com/tj/commander.js/)：一个快速开发 Node.js 命令行工具的库；
2. [co](https://github.com/tj/co)：用同步的方式编写异步流程的代码；
3. [co-prompt](https://github.com/tj/co-prompt)：在命令行提供提示信息并接收用户输入；
4. [copy-template-dir](https://github.com/yoshuawuyts/copy-template-dir)：复制整个目录到指定路径，并且能够通过变量注入信息。

在`simple-cli/`：

```bash
$ yarn add commander co co-prompt copy-template-dir
```

在`package.json`中添加`bin`：

```js
{
  "name": "simple-cli",
  "version": "1.0.0",
  "license": "MIT",
  "dependencies": {
    "co": "^4.6.0",
    "co-prompt": "^1.0.0",
    "commander": "^2.17.1",
    "copy-template-dir": "^1.4.0"
  },
  "bin": {
    // 需要作为命令行调用，要添加 bin
    "simple-cli": "./index.js"
  }
}

```

创建相应文件，最后目录结构可以是这样的：

```bash
.
├── index.js
├── lib
│   └── init.js
├── node_modules
├── package.json
└── yarn.lock
```

## 开发

### 创建命令行工具

可以直接使用`node ./index.js`进行运行，也可以使用`yarn link`后直接通过`simple-cli`进行使用（`yarn unlink`可以进行取消）。

`index.js`：

```js
#!/usr/bin/env node
// 因为是作为命令行调用的，在第一行加上 #!/usr/bin/env node

'use strict';
const program = require('commander');
const packageJSON = require('./package.json');
const init = require('./lib/cmd/init');

program.version(packageJSON.version).usage('<command> [options]');

program
  .command('init')
  .description('创建新新项目')
  .alias('i')
  .action(() => {
    // 接收到 init 命令执行 init() 方法
    init();
  });

program.parse(process.argv);

if (program.args.length == 0) {
  // 这里是处理没有输入参数命令的时候，显示 help
  program.help();
}
```

`./lib/init.js`：

```js
'use strict';

// 导出一个方法
module.exports = () => {};
```

执行`simple-cli`：

```bash
$ simple-cli

  Usage: simple-cli <command> [options]

  Options:

    -V, --version  output the version number
    -h, --help     output usage information

  Commands:

    init|i         创建新新项目
```

> 如`yarn link`之后使用`simple-cli`提示`permission denied: simple-cli`，那么需要对 linked file 执行`chmod +x ./index.js`。

### 添加模板

根目录添加`templates/templateA/`，最终的目录结构：

```bash
.
├── index.js
├── lib
│   └── init.js
├── node_modules
├── package.json
├── templates
│   └── templateA
└── yarn.lock
```

简单添加一个模板`templateA`：

```bash
.
├── CONTRIBUTING.md
├── README.md
├── _package.json
├── nwb.config.js
├── src
└── tests

# 注意：
# 1. _package.json，_ 开头的文件通过 copy-template-dir 拷贝后会自动删除 _。
# 2. 文件中类似 {{变量名}} 的地方可通过 copy-template-dir 自动注入信息。
```

### 定义`init.js`

```js
'use strict';

const { exec } = require('child_process');
const co = require('co');
const prompt = require('co-prompt');
const copy = require('copy-template-dir');
const path = require('path');

module.exports = () => {
  co(function* () {
    // 处理用户输入
    const projectName = yield prompt('Project name: ');
    const description = yield prompt('Description: ');

    // 执行 simple-cli 时所处的路径
    const currentPath = path.resolve(process.cwd(), './');
    // 模板路径
    const templateDir = path.resolve(__dirname, '../templates/templateA');
    // 输出路径
    const outDir = path.resolve(currentPath, projectName);
    // 粘贴模板时注入的信息
    const values = {
      name: projectName,
      description,
    };

    // 拷贝模板
    copy(path.resolve(templateDir), outDir, values, (err, createdFiles) => {
      if (err) {
        process.exit(1);
      }

      createdFiles.forEach((filePath) => console.log(`Created ${filePath}`));

      // Node.js 执行命令
      const cmdStr = `cd ${outDir} && yarn`;
      console.log(`now excuting: ${cmdStr}`);
      exec(cmdStr, (error) => {
        if (error) {
          process.exit(1);
        }

        console.log('\n √ Generation completed!');
        process.exit(0);
      });
    });
  });
};
```

## 使用

```bash
$ simple-cli init

Project name: test
Description: some description
Created /Users/daief/Desktop/test/.travis.yml
Created /Users/daief/Desktop/test/README.md
Created /Users/daief/Desktop/test/CONTRIBUTING.md
Created /Users/daief/Desktop/test/package.json
Created /Users/daief/Desktop/test/nwb.config.js
Created /Users/daief/Desktop/test/tests/.eslintrc
Created /Users/daief/Desktop/test/tests/App-test.js
Created /Users/daief/Desktop/test/src/App.css
Created /Users/daief/Desktop/test/src/App.js
Created /Users/daief/Desktop/test/src/index.css
Created /Users/daief/Desktop/test/src/index.html
Created /Users/daief/Desktop/test/src/index.js
Created /Users/daief/Desktop/test/src/react.svg
now excuting: cd /Users/daief/Desktop/test && yarn

 √ Generation completed!
```

## 结束

一个炒鸡简单的脚手架就完成了，还同时了解了如何通过 Node.js 构建一个交互式的命令行工具。

另，还可以添加[chalk](https://github.com/chalk/chalk)来美化命令行的输出，又或是发布到 npm 分享给小伙伴使用。

项目地址：[https://github.com/daief/simple-cli](https://github.com/daief/simple-cli)。

Thanks. 😃
