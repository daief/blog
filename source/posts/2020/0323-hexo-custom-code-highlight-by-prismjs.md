---
title: 使用 prismjs 自定义 Hexo 代码高亮
date: 2020-03-23 16:50:24
id: hexo-custom-code-highlight-by-prismjs
categories: ['前端', 'Hexo']
tags:
  - Blog
  - Hexo
keywords:
  - hexo
  - code highlight
  - prismjs
description:
---

一直就想优化一下 Hexo 的代码高亮部分来着，对 `ts`、`tsx` 部分的支持一直不太好；也许直接更新 Next 就能直接解决，但博客部分已经魔改了不少，本着这个原则就继续魔改下去好了。

> 本站是在 Next 5 的基础上建成的，不过本文内容与 Next 5 的关系不大

<!-- more -->

## 重写代码块的 render

我使用了 [hexo-renderer-marked](https://github.com/hexojs/hexo-renderer-marked) 插件，这个插件的作用就是将 `Markdown` 文件渲染成 `HTML`。

查阅文档，发现 `hexo-renderer-marked` 提供了扩展 [marked](https://github.com/chjj/marked) 插件的功能，`marked` 是真正进行 Markdown 转换的工具。

> 目前（hexo-renderer-marked@2.0.0 版本）暂未实现该功能，不过主分支上已经支持了，所以我暂时是直接使用了主分支上的代码。

`package.json` 中可以这么写：

```json
{
  "devDependencies": {
    // ...
    "hexo-renderer-marked": "https://github.com/hexojs/hexo-renderer-marked#40d8ca4532363dba74da7661335bbd8eea689cea"
    // ...
  }
}
```

不过在重写之前需要关闭默认的 highlight 功能，在根目录下 `_config.yml` 修改：

```diff
highlight:
+  enable: false
-  enable: true
```

那么事情就简单了，在 `scripts` 下创建脚本，命名随意，我将其放在了 `themes/next/scripts/daief/highlight.js`：

> `scripts` 下的脚本会在 Hexo 运行时自动被加载，可在此实现一些自定义的插件等。

```js
/**
 * 借助 hexo-renderer-marked 扩展，自定义渲染 code
 * ref：https://github.com/hexojs/hexo-renderer-marked/blob/master/README.md#extensibility
 */

const prism = require('prismjs');
const loadLanguages = require('prismjs/components/index');
loadLanguages();

const escapeHtml = (str) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[tag] || tag),
  );

hexo.extend.filter.register('marked:renderer', function (renderer) {
  // 定义 renderer.code 来自定义代码块的解析行为
  renderer.code = (sourceCode, language) => {
    const codeResult =
      prism.languages[language] && sourceCode
        ? prism.highlight(sourceCode, prism.languages[language])
        : escapeHtml(sourceCode);

    return `<pre class="line-numbers language-${language}"><code>${codeResult}</code></pre>`;
  };
});
```

该脚本的功能就是使用 [prismjs](https://github.com/PrismJS/prism) 来解析代码块，重写默认的行为。

## 添加样式文件

在主题配置文件（`themes/next/_config.yml`）下添加一个自定义选项 `prismjs`，这样一来版本的维护就比较方便了：

```diff
+ prismjs: https://cdn.jsdelivr.net/npm/prismjs@1.19.0
```

自己添加的东西最好跟库分开，Next 也已经考虑到了这一点，如果需要在每个页面的 `<head>` 中添加内容，只需在 `themes/next/layout/_partials/head/custom-head.swig` 中编辑即可，`prismjs` 的样式也在此处添加：

```html
<!-- prismjs style -->
<link
  rel="stylesheet"
  href="{% raw %}{{ theme.prismjs }}{% endraw %}/plugins/line-numbers/prism-line-numbers.css"
/>
<link
  rel="stylesheet"
  href="{% raw %}{{ theme.prismjs }}{% endraw %}/themes/prism.css"
/>
<style>
  .code[class*='language-'],
  pre[class*='language-'] {
    font-size: 13px;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }
</style>
```

## 添加行号（或是其他 prismjs 插件）

> 这一步有点坑，我期望的是在构建阶段就完成代码块标签的解析，最终页面在浏览器中展示时只需添加样式支持即可。
>
> HTML 解析已经成功在构建阶段完成了，但像行号以及一些其他 prismjs 插件的功能则需要在浏览器中进行。如果仅仅是在浏览中多加一次调用插件的步骤也就算了，可偏偏插件的触发是在 prismjs 的 hooks 中绑死的；
>
> 若是想正常触发 prismjs 的 hooks，那么 prismjs 会在浏览器当中对代码块再次进行解析（这里的意思是假如此时 HTML 没有提前处理，将纯文本的代码块传给 prismjs，prismjs 也能解析出操作符、关键字并包裹上相应的标签和类名），也就是说第一步重写代码块解析的步骤就相当于白费了；
>
> 可在浏览器当中解析的结果竟与构建阶段的解析会有不同，有些高亮会有问题；奈何行号插件只能运行在浏览器，同时又不想改太多，最终还是按照 prismjs 官方推荐的方式来使用了。
>
> 如果可能大概以后有空的话再来优化一下吧。

行号插件需要在 HTML 中添加 `line-numbers` 类名以进行标注，这一步在重写代码块的解析过程中（提前解析并不是白费的，确信！）已经完成。

同样本着自定义内容分离的原则，先在 `themes/next/layout/_layout.swig` 中新增：

```diff
+  {% raw %}{% include '_custom/page-tail.swig' %}{% endraw %}
</body>
</html>
```

接着创建 `themes/next/layout/_custom/page-tail.swig` 并添加以下内容，参照官方文档来即可：

```html
<!--
prismjs 功能
ref：https://prismjs.com/#basic-usage
-->
<script>
  window.Prism = window.Prism || {};
  // 打开注释的话就不会自动处理了
  // window.Prism.manual = true;
</script>
<script src="{% raw %}{{ theme.prismjs }}{% endraw %}/components/prism-core.min.js"></script>
<script src="{% raw %}{{ theme.prismjs }}{% endraw %}/plugins/autoloader/prism-autoloader.min.js"></script>
<script src="{% raw %}{{ theme.prismjs }}{% endraw %}/plugins/line-numbers/prism-line-numbers.min.js"></script>
```

## 结语

这么一来就结束了，这么个处理，还是有点不满意的；不过现在至少能支持 `ts`、`tsx` 了，这样暂且就够了。

完。
