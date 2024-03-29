---
title: 记一次单页应用的加载优化
date: 2018-12-25 23:54:23
id: try-to-improve-spa-load-performance
categories: "前端"
tags:
  - SPA
  - performance
keywords:
description:
---

如今的前端页面越来越丰富了，承载着各种功能。而随之增长的则是相应的代码量，加上三方 SDK 的接入以及单页应用（SPA）的特性，一次页面访问会出现慢的感觉，是时候来关注页面的加载优化了。

本文简略描述关于 React 单页应用的加载优化，下文所指加载一般包括下载、执行两个步骤。

<!-- more -->

## 一次页面（SPA）加载过程

1. 下载 HTML 文档，开始解析；
2. 由上至下下载 HTML 文档中引入的资源（CSS、JS），当 CSS 加载完毕可认为完成首次渲染绘制；
3. 等待 JS 下载、执行，完成 SDK 加载、React 框架加载；
4. 业务代码加载、初始化、页面拉取数据、事件响应等，完毕后可认为此时为首次有效绘制；
5. 其他图片、媒体等加载，至此页面基本加载完毕。

![](https://www.superbed.cn/pic/5c224eb0c4ff9e2b4d699618)

## 优化方向

针对上述过程以及页面特性，以前端手段，接下来从以下四个个方面入手优化：

1. 资源大小方面。只要资源更小，下载速度和执行速度都将获得提升；
2. 资源加载，浏览器方面；
3. 首屏方面优化，避免展示空白给用户；
4. CDN 加速、图片显示优化、缓存等其他方面。

## 减小资源大小

性能提升很多时候就是一门做减法的艺术。

### 代码拆分、动态加载

一般情况下，SPA 的一个特点就是借助 webpack 等工具将最终代码打包在一个或两类（main.js、vendor.js）文件中，这些文件实际上包含了一整个应用的内容。这样带来了一个问题，当只访问其中一个路由页面时，加载了很多不必要的代码。

那么，很自然地，可以选择把不属于当前页面的模块分离出去，等用到之时，再进行获取。幸运的是，在 webpack 的打包环境中，只需要使用动态导入的语法就能自动实现代码分离：`import x from 'x'` => `import('x').then(x => { /* */ })`。

![](https://www.superbed.cn/pic/5c224d3dc4ff9e2b4d699612)

对于 React 应用，有一个十分好用的库 [react-loadable](https://github.com/jamiebuilds/react-loadable)，基于动态导入语法封装。使用官方的介绍，用于装载具有动态导入组件的高阶组件。该库实现基于组件粒度的拆分，将动态导入的过程、结果都包装成了组件，使用也十分简单，来看下具体使用：

```js
import Loadable from 'react-loadable';
import Loading from './my-loading-component';

// 结果是个组件，可直接使用
// 加载时自动展示 loading 样式
const LoadableComponent = Loadable({
  loader: () => import('./my-component'),
  loading: Loading,
});

export default class App extends React.Component {
  render() {
    return <LoadableComponent/>;
  }
}
```

如此一来，再使用 webpack 打包，会发现多了不少用于动态引入的文件。另外，代码的组织对于拆分是有一定影响的。以下分别是未拆分、基于路由拆分、整理代码（期间删了部分无用代码）后基于路由拆分情况下的打包情况。可对比看出每个页面加载的总资源大小减少了。

![](https://www.superbed.cn/pic/5c224d3dc4ff9e2b4d699613)

`webpack-bundle-analyzer` 是一个十分有用的打包结果分析插件，能帮助我们直观看出打包结果的具体组成，从而作出进一步调整优化。

![](https://www.superbed.cn/pic/5c224d3dc4ff9e2b4d699614)

温馨提示：

- TypeScript 中使 `import()` 生效，得在 tsconfig.json 中设置 `"module": "esnext"`，[更多详情](https://github.com/webpack/webpack/issues/5703#issuecomment-357512412)。
- 该方式对于大型 SPA 的优化效果较为明显。

### 减少代码体积

这里所说的主要是一些细节方面的处理，一般效果可能会比较小，往往不需要要太多的改动，能优化一点是一点，秉承蚊子腿也是肉的原则。

1. Webpack 支持摇树（Tree Shaking），借助该特性，能自动优化掉代码中的无用部分。但该特性的使用并不那么简单，以至于实际效果的表现并不理想。简单了解，它是要借助 ES6 的静态导入语法进行分析的，而经常使用的 npm 模块都是 commonjs 方式，不支持 Tree Shaking。这里对此没有过多研究，更多细节可参考文章底部列出的文章。
2. 注意模块的按需引入。典型的就是 lodash，不要只用到几个方法却全部打包了。当然在插件配置支持的情况下，可直接`import { throttle } from 'lodash'`。
3. 有些工具会自动包含部分 polyfill，生产环境又引了一份 polyfill，应注意避免重复引入。
4. 随着迭代等种种因素，产生了用不到的代码，最后主动删除。
5. ...

## 浏览器资源加载优化

在此，引入一个概念：关键请求链（Critical-Request-Chains）。

> 关键请求链：可视区域渲染完毕（首屏），并对于用户来说可用时，必须加载的资源请求队列，就叫做关键请求链。

简单来说，对于直接在 index.html 文档中引用的 JS、CSS、图片等资源被认为是关键请求链，浏览器会优先进行处理。

### 动态加载与关键请求链

以之前提到的拆分结果为例，拆分后单个页面需要加载的资源大小变化不显著，这时候去测量页面的加载性能得到的结果也许会是不升反降，降的主要是首次有效绘制。

![](https://www.superbed.cn/pic/5c224d3dc4ff9e2b4d699615)

这是单个页面的加载情况，动态加载了两个模块，而这两个模块是不属于关键请求链的。这种情况下，该页面的加载情况简述如下：

1. vendor.js、app.js 加载完毕；
2. 上述 JS 执行到特定逻辑判定该页面需要 2.js、6.js，于是发送请求，加载对应资源；
3. 2.js、6.js 动态 JS 部分加载完毕；
4. 最终页面显示。

该步骤相比初始状态多了一个步骤，当这些新增的开销大于初始状态的时候，页面加载的整体性能是下降的。

要在当前情况下发挥拆分代码、动态加载的意义，有以下一种思路：

假设一个 SPA 包含列表页、详情页，列表页是一级**关键页面**，可以只对详情页相关的内容进行分离。如此一来，对于列表页依旧只有 app.js、vendor.js 部分，但是少了详情页相关的东西，因此做到了关键页面的性能加载提升。

### 延迟非关键资源

除了必要的框架、业务代码，页面中常常引入了一些 SDK，比如打点功能。

以打点为例，这类资源实际上跟首屏的渲染没有关系，即使在页面全部加载完毕三秒后再引入也是无伤大雅的。

而我们的现状是，这类资源被直接写在 head 部分引入，被浏览器认为是关键资源优先处理，势必对页面的加载有一定的影响。

对于这类非关键资源，不需要列在关键请求链当中。以此处的神策打点为例，我们将他的顺序写在文档底部，并添加了 `defer` 属性，告诉浏览器神策的下载不是阻塞的，并且将它的执行时机进行延后。

回顾之前的加载瀑布图，可以看到 `sensorsdata.min.js` 的加载优先级（Priority）是`Low`，此时神策的加载是不影响首屏的渲染了。

script 异步加载属性 `async`、`defer` 介绍：

![](https://www.superbed.cn/pic/5c224d3bc4ff9e2b4d69960e)

早期情况，浏览器对于 JS 的下载、执行可能是严格串行模式处理的，只有上一个 JS 加载完毕后才会开始下一个 JS 的下载、执行。

但实际上，目前的浏览器对于资源加载都有自己的策略，基本上都会去并行下载资源，即使是单线程执行的 JS 脚本（观察上述加载瀑布图也能发现这点）。因为这样做能够减少 JS 的下载时间，不过有一点是不变的，严格按照 JS 的顺序进行执行。

### 减少请求

此处排除图片等媒体资源进行讨论。

往往为了缓存考虑，我们会把 React、ReactDOM 单独抽离，打包时也会采取一种策略将第三方不经常改动的部分抽离出来。因此，一个页面的请求数会变多。但浏览器对于一个域名的并发请求下载数量是有限制的。再加上 SDK、polyfill 等可能就突破上限了，那么多余的只能等待。

针对这种情况一般有几种方式：

1. 资源够小的时候直接嵌入在 HTML 文档中；
2. 考虑是否有必要将打包结果拆分出 vendor；
3. 多个资源的请求进行合并。

## 首屏空白优化

即使优化了资源加载，SPA 首屏空白的问题是依旧存在的，因为要等待 JS 的下载、执行。

问题的根本是 HTML 文档中只有一个空节点，那么只要预先插入一些内容就能解决白屏问题了，处理方法很简单。

### 通用 Loading 样式

处理起来最方便的一种，只要在 HTML 模板文件中插入内容即可。写在 `#root` 中是因为在 React 渲染后会自动顶掉了 Loading，免去了手动的处理。


```html
<div id="root">
  <div id="loading">
    <!-- ... 一些 loading 代码 -->
  </div>
</div>
```

### 多页面定制的预渲染样式

这里的多页面指的是前端路由的多页面，都在一个 React 单页应用的范围内。在此基础上要实现这个效果稍微复杂一些。

首先介绍一下 URL 中 Hash 作用。`#` 代表网页中的一个位置，其右面的字符，就是该位置的标识符。浏览器读取这个 URL 后，会自动将 Hash 标注的内容位置滚动至可视区域。`#` 是用来指导浏览器动作的，浏览器发出的 HTTP 请求中不包括 `#`，所以 Hash 对服务器端完全无用。

之后再来看 Hash 模式的前端路由：

```js
const url1 = 'http://example.com/project/#/page1'

const url2 = 'http://example.com/project/#/page2'

const url3 = 'http://example.com/project/#/page1/subpage2'

```

访问上述任意 URL，实际上浏览器发出的请求都是`http://example.com/project/`，服务端就会返回`http://example.com/project/index.html`。之后，代码执行，路由框架匹配前端路由，最终渲染出对应页面。

对此，实现目的，有三种想法：

1. 将多种预渲染样式整合在 HTML 中，使用 JS 匹配前端路由决定需要显示的样式；
2. 每一个页面单独写成一个 React 单页模块；
3. 想办法实现不同的路由返回不同的 HTML 文档。

下面主要介绍方式 3.

想要根据不同的路由返回对应不同的 HTML 文档

#### step 1

第一步要改变前端路由方式（Hash => Browser）。

```js
// Browser 模式下的 URL 以及服务端返回的内容
const url1 = 'http://example.com/project/page1'
// http://example.com/project/page1/index.html

const url2 = 'http://example.com/project/page2'
// http://example.com/project/page2/index.html

const url3 = 'http://example.com/project/page1/subpage2'
// http://example.com/project/page1/subpage2/index.html

```

#### step 2

第二步，在服务器的对应目录下提供对应的 HTML 文档。
  但很多时候我们并没有需求为每个路由页面提供 HTML 文档，这时候去访问一个前端路由而后端没提供文档时会出现 404，这不是我们想要看到的。因为这个路由页面是由前端渲染、在前端是存在的。
  这时候就要做一个处理，就是常说的 Nginx 重定向（以 Nginx 为例），表示该路由后端处理不了，交给前端处理。

```bash
location /project {
  try_files $uri $uri/ index.html;
}
```

![](https://www.superbed.cn/pic/5c224d3bc4ff9e2b4d69960f)

#### step 3

第三步，开发时应该怎么处理？总不能手动写好这些 HTML 文档再上传到服务器。介绍两种方式，都是基于 Webpack 进行打包生成：

##### 3.1

使用多个 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)，因为我们的项目分为了多个 React 项目，每个项目的页面不会很多，因此使用多个 `html-webpack-plugin` 没有打包性能的问题。

```js
const routesCfg = [
  {
    path: '/user',
    template: './documents/user.html'
  },
  {
    path: '/user/profile',
    template: './documents/user.html'
  },
]

routesCfg.forEach(r => {
  webpackConfig.plugins.push(
    new HtmlWebpackPlugin({
      filename: `${r.path.replace(/^\//, '')}/index.html`,
      template: path.join(__dirname, r.template),
    })
  )
})
```

![](https://www.superbed.cn/pic/5c224d3bc4ff9e2b4d699610)

该方式需要手动编写预渲染的内容，但能做到精细的控制。

另外，有个小问题：如果 publicPath 是相对路径的话，打包结果子目录下的资源引用的路径会有问题。

##### 3.2

使用 [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin)。提供配置，打包完成后会启动一个本地服务，使用无头浏览器（puppeteer）访问传入配置中的路径，接着抽取页面的文档内容，重新生成新的 HTML 文件。

该方式生成的预渲染内容是页面最终的样式，适合一些静态类型页面的显示，切忌用于生成动态内容的预渲染（比如用户个人信息页面，你肯定不希望打开页面时先显示的是其他人的信息再变成自己的，这个其他人的信息就是在抽取页面内容的时候注入的）。

当使用 CDN 的时候需要注意了，该插件启动本地服务访问页面时，资源是还没上传至 CDN 的（这还属于 Webpack 的打包流程，一般是在打包流程结束后进行 CDN 上传）。

此处提供两个思路解决该问题：

1. 定制个 Webpack 插件，在该插件前生效，将文件提前上传至 CDN。不要忘了，打包结束后还需要再次上传。
2. 实现请求拦截，将访问 CDN 的请求劫持到本地相对目录的文件。但是该插件没有暴露 puppeteer 的对象，实现起来会比较困难。

## 其他方面

1. 开启 CDN ，加速资源的网络传输；
2. 首屏列表类页面应控制渲染数量，避免生成用不到（用户还不可见）的节点（有时也会需要预先加载，视具体情况而定）；
3. 条件允许时，使用图片服务辅助前端的图片显示，做到格式、尺寸、品质的控制；
4. 设置资源返回的请求头字段，如 cache-control、expires 等，做到资源缓存，加快二次访问；
5. 考虑 Service Worker 缓存技术的使用
6. ...


以上，是新人对页面加载优化的探索，实际上一定还存在不少可优化、提升用户体验的点，接下来还需要更多的实践。

---

参考链接 & 相关阅读:

- [React 16 加载性能优化指南](https://zhuanlan.zhihu.com/p/37148975)
- [polyfill 按需返回](https://polyfill.io/v2/docs/)
- [你的 Tree-Shaking 并没什么卵用](https://segmentfault.com/a/1190000012794598)
- [Tree-Shaking 性能优化实践 - 原理篇](https://juejin.im/post/5a4dc842518825698e7279a9)
- [浏览器页面资源加载过程与优化](https://juejin.im/post/5a4ed917f265da3e317df515)
- [Chrome 中的 First Meaningful Paint](https://juejin.im/entry/598080226fb9a03c5d535cd5)
- [关键渲染路径](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/)
- [服务端渲染 vs 客户端渲染](https://juejin.im/entry/5a111eb7f265da431c6fe51c)
- [构建时预渲染：网页首帧优化实践](https://tech.meituan.com/first_contentful_paint_practice.html)
- [淘宝首页性能优化实践](http://taobaofed.org/blog/2016/04/06/optimize-in-tbhome/)
- [精读前后端渲染之争](https://github.com/camsong/blog/issues/8)
- [URL 的井号](http://www.ruanyifeng.com/blog/2011/03/url_hash.html)
