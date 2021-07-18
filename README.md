# TODO

- [x] webpack dev 优化
- [ ] page title
- [x] about, others page, simple pages
- [ ] 404 page
- [ ] 文章置顶 sticky
- [ ] 文章草稿/发布/置顶状态区分
- ~~[ ] try esbuild or vite~~

# Usage

Via `git submodule`.

First install this theme.

```bash
$ git submodule add git@github.com:daief/hexo-theme-spa.git themes/spa
```

Update this theme.

```bash
# init submodule
$ git submodule init

# update submodules
$ git submodule update
```

Some git submodule commands.

```bash
# check current submodule status
$ git submodule status

# rm cache of submodules
$ git rm --cached themes/spa

```

# Note

- Should restart `hexo server` if update `_config.yml`
- `Node >= 12`
- 一些 `after_post_render` 处理 HTML 的 filter 并不会有效果

# Links

- Vue3 SSR: <https://stackoverflow.com/questions/64899690/vue-3-server-side-rendering-with-vuex-and-router>
- vite: <https://cn.vitejs.dev/guide/ssr.html>
