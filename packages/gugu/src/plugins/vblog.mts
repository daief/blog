import { type Plugin, type ViteDevServer } from 'vite';
import { getService } from '../services/accessor.ts';
import { RouteService } from '../services/route.service.ts';
import ejs from 'ejs';
import { FileService } from '../services/file.service.ts';
import { watch } from '@vue/reactivity';
import { type IRawRoute } from '../../types/index.mts';

const renderFileTpl = (file: string, env: any) => {
  return ejs.renderFile(file, env, {});
};

/**
 * 虚拟模块插件
 * @returns
 */
export const createVBlogPlugin = () => {
  const routeService = getService(RouteService);
  const fileService = getService(FileService);

  const vIdPrefix = 'vblog:';
  const vRoutesId = 'vblog:routes';

  const getRoutesCode = () => {
    const routes = routeService.getAllRoutes();
    const arrStr = routes
      .map((route) => {
        return `{
        path: "${route.path}",
        component: () => import('${route.vid}') }`;
      })
      .join(',');
    return `export default [${arrStr}]`;
  };

  const plugin: Plugin = {
    name: 'blog:vblog',
    configureServer(server: ViteDevServer) {
      const invalidateModule = (id: string) => {
        const mod = server.moduleGraph.getModuleById(id);
        if (mod) {
          server.reloadModule(mod);
          console.log(`[vblog] invalidated: ${id}`);
        }
      };

      watch(
        () => routeService.allRoutes.value,
        (newRoutes: IRawRoute[]) => {
          console.log('[vblog] Route data changed, invalidating modules...');

          invalidateModule(vRoutesId);

          if (newRoutes) {
            newRoutes.forEach((route) => invalidateModule(route.vid));
          }
        },
      );
    },
    resolveId(id) {
      if (id.startsWith(vIdPrefix)) return id;
      if (routeService.getAllRoutes().some((it) => it.vid === id)) return id;
    },
    async load(id, options) {
      if (id === vRoutesId) return getRoutesCode();

      const target = routeService.getAllRoutes().find((it) => it.vid === id);
      if (target) {
        const code = await renderFileTpl(
          fileService.resolveApp('templates/articles.tpl.ejs'),
          target.data,
        );

        return code;
      }
      return null;
    },
  };

  return plugin;
};
