import path from 'path';
import { GContext } from './ctx';
import fs from 'fs-extra';
import { createServer } from './createServer';
import axios from 'axios';

export async function generate(ctx: GContext) {
  const { dao } = ctx;
  const outDir = ctx.userConfig.outDir;

  const routes = dao.getRoutes();
  const { server, serverAddress } = await createServer(ctx, {});

  fs.emptydirSync(outDir);
  await fs.copy(ctx.resolveRoot('dist/client'), outDir);

  for (const url of ['/sitemap.xml', ...routes]) {
    const html = await axios
      .get(`${serverAddress}${encodeURI(url)}`)
      .then((resp) => resp.data)
      .catch((e) => {
        try {
          if (e.response.status === 404) {
            return e.response.data;
          }
        } catch (error) {}
        console.log(url, e);
        throw e;
      });

    let uri = url;
    switch (url) {
      case '/':
        uri = '/index.html';
        break;
      case '/404.html':
        uri = url;
        break;
      case '/sitemap.xml':
        break;
      default:
        uri = url + '/index.html';
        break;
    }

    const filePath = path.join(outDir, uri);
    fs.outputFileSync(filePath, html, {
      encoding: 'utf-8',
    });
    console.log('✨ Pre-Rendered:', uri);
  }

  server.close();
}
