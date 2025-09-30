# 项目分析

这是一个基于 `pnpm` workspace 管理的 monorepo 项目，其核心是一个名为 `@blog/gugu` 的本地包，它扮演了博客构建引擎的角色。

项目的整体思路非常清晰和现代化，可以总结为以下几点：

1.  **架构核心**：项目没有将所有逻辑都堆砌在根目录的 `vite.config.ts` 中，而是将其抽象到了 `@blog/gugu` 包内。根目录的 `vite.config.ts` 只负责调用 `gugu` 包提供的 `extendConfig` 函数，这是一种非常优雅的封装。

2.  **自定义 Vite 插件**：`@blog/gugu` 包的核心是两个自定义 Vite 插件：
    *   `blog:vblog` (`vblog.mts`)：这是博客的“大脑”。它通过 Vite 的虚拟模块（以 `vblog:` 为前缀）机制，动态地生成了路由配置 (`vblog:routes`)。它会扫描文章，然后使用 EJS 模板 (`articles.tpl.ejs`) 将文章数据渲染成最终的页面模块。这避免了在客户端进行大量的文章数据处理。
    *   `blog:md` (`md.mts`)：这个插件目前看还是一个“骨架”，它初始化了 `MarkdownService`，但还没有实现具体的 Markdown 文件到 HTML 的转换逻辑。可以预见，它将来会负责拦截 `.md` 文件的导入请求，并将其内容转换为 Vue 组件或 HTML 字符串。

3.  **静态站点生成 (SSG)**：项目的 `build` 命令是 `vite-ssg build`，这表明它最终的目标是生成一个纯静态网站。`vite-ssg` 会预渲染所有页面，带来极致的加载性能和良好的 SEO。

4.  **面向服务设计**：在 `gugu` 包内部，代码被组织成了多个 `Service`，例如 `RouteService`、`FileService` 和 `MarkdownService`。这种设计模式使得各部分职责分明，易于维护和扩展。

总的来说，这是一个架构设计优良的、基于 Vite 插件和虚拟模块机制的静态博客生成器。它充分利用了 Vite 的能力来实现一个高效、可定制的构建流程。
