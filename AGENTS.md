# Repository Guidelines

## 项目结构与架构

这是一个由 pnpm workspace 管理的静态博客 monorepo。内容位于 `source/`：文章按年份放在 `source/posts/<year>/`，公共静态资源在 `source/public/`，`about.md`、`resume.md` 等为独立页面；文章相关图片应优先与文章放在同名目录中。

博客引擎位于 `packages/gugu/`。`app/` 存放 Vue 界面，`src/` 存放构建与业务逻辑，`types/` 存放声明文件。根目录 `vite.config.ts` 仅通过 `@blog/gugu` 的 `extendConfig` 扩展配置；不要将引擎逻辑堆入根配置。构建产物在 `dist/`，禁止手动修改。

引擎以服务和 Vite 插件组织：`FileService`、`MarkdownService` 等负责单一职责；`plugins/vblog.mts` 使用 `vblog:` 虚拟模块扫描文章并生成路由和页面模块。修改路由或文章渲染时，优先在对应 service/plugin 中扩展，避免跨层耦合。

## 构建、检查与本地开发

- `pnpm dev`：启动 `scripts/dev.mjs` 定义的本地开发流程。
- `pnpm build`：通过 `vite-ssg build` 生成 `dist/` 静态站点。
- `pnpm --filter @blog/gugu check`：执行 TypeScript 类型检查，不生成文件。

不要主动运行构建命令；排查开发错误时，查看 `tmp/dev.log` 中 dev server 的日志。

使用 pnpm 和已提交的 `pnpm-lock.yaml`。根项目要求 Node 18+，`@blog/gugu` 要求 Node 22+；开发整个工作区时使用 Node 22 或更高版本。

## 代码与内容规范

遵循 `.editorconfig`：2 空格缩进、LF、UTF-8、文件末尾换行。Prettier 使用单引号和尾随逗号；提交前格式化修改过的 TypeScript、Vue 和配置文件。沿用现有扩展名：应用代码用 `.ts`，引擎模块用 `.mts`，组件用 `.vue`。

文章命名为 `MMDD-描述性-kebab-case.md`，例如 `source/posts/2025/1103-blog-upgrade-2025.md`。不要在未完成的 `blog:md` Markdown 导入流程中假定已有转换能力；变更前先确认现有调用链。

## 验证、提交与 PR

项目未配置自动化测试。修改引擎或 UI 后运行类型检查；涉及站点或内容的变更运行 `pnpm build`，明显的视觉改动还应使用 `pnpm dev` 在浏览器中检查。

提交信息应简短、使用祈使语气，并延续现有 `fix:`、`build(deps):`、`add` 等风格。PR 需说明用户可见的影响、关联 issue 和已执行的验证；布局或样式变更附前后截图，并说明是否影响生成内容或部署。
