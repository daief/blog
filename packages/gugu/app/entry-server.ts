import { createApp } from './main';
import { renderToString } from '@vue/server-renderer';
import { createSiteContext } from './utils/siteContext';
import axios from 'axios';
import { merge } from 'lodash';

export async function render(
  url,
  manifest,
  options: {
    serverAddress: string;
    serverState: any;
  },
) {
  const { app, router, store } = createApp();

  store.replaceState(merge({}, store.state, options.serverState));

  const site = createSiteContext({
    axios: axios.create(),
  });
  site.axios.defaults.baseURL = options.serverAddress;
  app.use(site);

  // set the router to the desired URL before rendering
  router.push(url);
  await router.isReady();

  const { matched } = router.currentRoute.value;

  await Promise.all(
    matched.map((it) => {
      const C: any = it.components.default;
      if (typeof C.asyncData !== 'function') return;
      return C.asyncData({ store, route: router.currentRoute.value, site });
    }),
  );

  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const ctx: any = {};
  const html = await renderToString(app, ctx);

  // the SSR manifest generated by Vite contains module -> chunk/asset mapping
  // which we can then use to determine what files need to be preloaded for this
  // request.
  const preloadLinks = renderPreloadLinks(ctx.modules, manifest);
  return [html, preloadLinks, store.state];
}

function renderPreloadLinks(modules, manifest = {}) {
  let links = '';
  const seen = new Set();
  modules.forEach((id) => {
    const files = manifest[id];
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file);
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}

function renderPreloadLink(file: string) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`;
  } else if (file.endsWith('.woff')) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
  } else if (file.endsWith('.woff2')) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
  } else if (file.endsWith('.gif')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/gif" crossorigin>`;
  } else if (file.endsWith('.jpg')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg" crossorigin>`;
  } else if (file.endsWith('.jpeg')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg" crossorigin>`;
  } else if (file.endsWith('.png')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/png" crossorigin>`;
  } else {
    // TODO
    return '';
  }
}
