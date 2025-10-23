---
title: 简单学习 antd 的 build 步骤
date: 2018-09-17 21:07:46
id: learn-how-antd-build-a-npm-lib
categories: ['前端']
tags:
  - antd
  - npm
  - gulp
  - antd-tools
keywords:
description:
---

想到去学习 antd 的打包步骤是因为自己学习制作 npm 模块时遇到了疑惑。查看`antd`（v3.9.2）的包，我们可以在目录下找到`dist/`、`lib/`、`es/`这三个目录，而且在`package.json`中指定的入口是`lib/`（`"main": "lib/index.js"`）。然而我只会使用`webpack`打包出一个`dist/`目录，于是查看了 antd 的相关内容进行了学习。

<!-- more -->

## 查看 package.json 中的脚本

```js
{
  "name": "antd",
  "version": "3.9.2",
  "scripts": {
    "test": "jest --config .jest.js",
    "test-node": "jest --config .jest.node.js",
    "test-all": "./scripts/test-all.sh",
    "lint": "npm run lint:ts && npm run lint:es && npm run lint:demo && npm run lint:style",
    "lint:ts": "npm run tsc && antd-tools run ts-lint",
    "lint:es": "eslint tests site scripts components ./.*.js ./webpack.config.js --ext '.js,.jsx'",
    "lint:demo": "cross-env RUN_ENV=DEMO eslint components/*/demo/*.md --ext '.md'",
    "lint:style": "stylelint \"{site,components}/**/*.less\" --syntax less",
    "lint-fix:ts": "npm run tsc && antd-tools run ts-lint-fix",
    "lint-fix": "npm run lint-fix:code && npm run lint-fix:demo",
    "lint-fix:code": "eslint --fix tests site scripts components ./.*.js ./webpack.config.js --ext '.js,.jsx'",
    "lint-fix:demo": "eslint-tinker ./components/*/demo/*.md",
    "sort-api": "node ./scripts/sort-api-table.js",
    "dist": "antd-tools run dist",
    "compile": "antd-tools run compile",
    "tsc": "tsc",
    "start": "rimraf _site && mkdir _site && node ./scripts/generateColorLess.js && cross-env NODE_ENV=development bisheng start -c ./site/bisheng.config.js",
    "start:preact": "node ./scripts/generateColorLess.js && cross-env NODE_ENV=development REACT_ENV=preact bisheng start -c ./site/bisheng.config.js",
    "site": "cross-env NODE_ENV=production bisheng build --ssr -c ./site/bisheng.config.js && node ./scripts/generateColorLess.js",
    "predeploy": "antd-tools run clean && npm run site && cp netlify.toml _site && cp -r .circleci _site",
    "deploy": "bisheng gh-pages --push-only",
    "pub": "antd-tools run pub",
    "prepublish": "antd-tools run guard",
    "pre-publish": "npm run test-all && node ./scripts/prepub",
    "authors": "git log --format='%aN <%aE>' | sort -u | grep -v 'users.noreply.github.com' | grep -v 'gitter.im' | grep -v '.local>' | grep -v 'alibaba-inc.com' | grep -v 'alipay.com' | grep -v 'taobao.com' > AUTHORS.txt",
    "lint-staged": "lint-staged",
    "lint-staged:ts": "tsc && node node_modules/tslint/bin/tslint",
    "lint-staged:es": "eslint ./.*.js ./webpack.config.js",
    "lint-staged:demo": "cross-env RUN_ENV=DEMO eslint --ext '.md'"
  }
}

```

可以看到有非常多的脚本，但现在只关注打包、编译部分，发现都是借助了`antd-tools`：

```js
"dist": "antd-tools run dist"
"compile": "antd-tools run compile"
```

## antd-tools

此处`antd-tools`作为命令行工具使用，进入`node_modules`查看 package.json 中的`bin`字段：

```js
"bin": {
  "antd-tools": "./bin/antd-tools.js",
  "antd-tools-run": "./bin/antd-tools-run.js"
},
```

顺藤摸瓜，发现`antd-tools/lib/gulpfile.js`是核心文件，创建了相应的`gulp.task`，执行`antd-tools run compile`命令时真正执行的是`gulp`中的`compile`任务：

```js
// antd-tools/lib/gulpfile.js
gulp.task('dist', (done) => {
  // dist 任务执行 dist 方法
  dist(done);
});

// 执行 compile 时会自动执行 compile-with-es 任务
gulp.task('compile', ['compile-with-es'], () => {
  // compile 任务执行 compile 方法
  compile();
});

gulp.task('compile-with-es', () => {
  compile(false);
});

// antd-tools/lib/cli/run.js
// 执行任务
require('../gulpfile');

gulp.start(task);
```

### 简单分析 dist 和 compile 任务

#### task dist

使用 webpack 进行打包，输出到 dist/

```js
function dist(done) {
  // 删除 dist/
  rimraf.sync(path.join(cwd, 'dist'));
  // 设置自定义的环境变量
  process.env.RUN_ENV = 'PRODUCTION';
  // 获取项目下 webpack 配置，ant-design/webpack.config.js
  const webpackConfig = require(path.join(cwd, 'webpack.config.js'));
  // 执行 webpack 打包行为
  webpack(webpackConfig, (err, stats) => {
    // ......
    done(0);
  });
}
```

#### task compile

`es/`、`lib/`都是通过该方法生成

```js
function compile(modules) {
  rimraf.sync(modules !== false ? libDir : esDir);
  // 编译 less 文件至 css
  const less = gulp
    .src(['components/**/*.less'])
    .pipe(
      through2.obj(function (file, encoding, next) {
        this.push(file.clone());
        // ......
        transformLess(file.path);
        // ......
      }),
    )
    // 输出到 es/ 或是 lib/
    .pipe(gulp.dest(modules === false ? esDir : libDir));

  // 移动 assets 文件
  const assets = gulp
    .src(['components/**/*.@(png|svg)'])
    .pipe(gulp.dest(modules === false ? esDir : libDir));

  // 编译 ts、tsx 文件
  let error = 0;
  const source = [
    'components/**/*.tsx',
    'components/**/*.ts',
    'typings/**/*.d.ts',
  ];
  // ts = require('gulp-typescript')
  // 追踪 tsConfig 可以发现只 tsc 只编译到 es6、preserve 的程度
  const tsResult = gulp.src(source).pipe(
    ts(tsConfig, {
      error(e) {
        /* ... */
      },
      finish: tsDefaultReporter.finish,
    }),
  );

  // jsx、es6+ 语法通过 babel 处理
  const tsFilesStream = babelify(tsResult.js, modules);
  // ts 声明文件的输出
  const tsd = tsResult.dts.pipe(gulp.dest(modules === false ? esDir : libDir));

  return merge2([less, tsFilesStream, tsd, assets]);
}
```

## JavaScript/Node 工程的目录结构介绍

> 以下结构不是绝对，但推荐去这么做，因为社区中大部分人遵循这样的约定。
> https://gist.github.com/tracker1/59f2c13044315f88bee9

根据链接内容的自我翻译：

- `lib/`是可运行的代码，前端开发中一般是已经经过`babel`降级处理过的
- `src/`一般是源文件代码存放的目录
- `build/`用于构建项目所需要的脚本或工具
- `dist/`编译后的可用于与其他系统一起使用的模块
- `bin/`用于任何可执行脚本，或编译后的二进制文件
- `test/`用于项目的测试脚本
- `unit/`单元测试的目录
- `integration/`集成测试的目录
- `env`用于测试所需要的环境

---

相关内容：[rollup](https://github.com/rollup/rollup)

本文叙述较为简略，文中不妥之处，欢迎指出、补充，感谢阅读。
