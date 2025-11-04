import { type Plugin, type ViteDevServer } from 'vite';
import { getService } from '../services/accessor.ts';
import { RouteService } from '../services/route.service.ts';
import ejs from 'ejs';
import { FileService } from '../services/file.service.ts';
import { watch } from '@vue/reactivity';
import { type IRawRoute } from '../../types/index.mts';
import { createLogger } from '../utils/logger.mts';
import fs from 'fs-extra';
import * as path from 'node:path';
import { ConfigService } from '../services/config.service.ts';

const logger = createLogger('[plugin:vblog]');

const renderFileTpl = (file: string, env: any) => {
  return ejs.renderFile(file, env, { filename: file });
};

/**
 * 虚拟模块插件
 * @returns
 */
export const createVBlogPlugin = () => {
  const routeService = getService(RouteService);
  const fileService = getService(FileService);
  const configService = getService(ConfigService);

  const debugDir = path.resolve(process.cwd(), 'node_modules/.vblog-temp');
  fs.emptyDir(debugDir);

  const vIdPrefix = 'vblog:';
  const vRoutesId = 'vblog:routes';

  const getRoutesCode = () => {
    const routes = routeService.allRoutes.value;
    const arrStr = routes
      .map((route) => {
        return `{
        path: "${route.path}",
        component: () => import('${route.vid}'),
        meta: ${JSON.stringify(route.meta || {})}
      }`;
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
          logger.info(`invalidated: ${id}`);
        }
      };

      // TODO 考虑使用 addWatchFile 添加 md 依赖
      watch(
        () => routeService.allRoutes.value,
        (newRoutes: IRawRoute[]) => {
          invalidateModule(vRoutesId);

          if (newRoutes) {
            newRoutes.forEach((route) => invalidateModule(route.vid));
          }
        },
      );
    },
    resolveId(id) {
      if (id.startsWith(vIdPrefix)) return id;
      if (routeService.allRoutesMap.value.has(id)) return id;
    },
    async load(id, options) {
      if (id === vRoutesId) {
        const code = getRoutesCode();
        fs.writeFile(path.join(debugDir, 'routes.js'), code, 'utf-8');
        return code;
      }

      const target = routeService.allRoutesMap.value.get(id);
      if (target) {
        const tplPath = fileService.resolveApp(
          `templates/${target.template}.tpl.ejs`,
        );
        this.addWatchFile(tplPath);

        const code = await renderFileTpl(tplPath, target.data);
        await fs.writeFile(
          path.join(debugDir, id.replace(/vm:/g, '')),
          code,
          'utf-8',
        );
        return {
          code,
        };
      }
      return null;
    },
    buildEnd() {
      // generate sitemap.xml
      const links = routeService.allRoutes.value
        .map(
          (it) =>
            `<url><loc>${configService.blogConfig.url}${it.path}</loc></url>`,
        )
        .join('');
      const xml = `<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${links}</urlset>`;
      this.emitFile({
        fileName: 'sitemap.xml',
        type: 'asset',
        source: xml,
      });
    },
  };

  return plugin;
};
