import path from 'path';
import { GContext } from './ctx';
import fs from 'fs-extra';
import { createServer } from './createServer';
import axios from 'axios';
import { promiseQueue } from './utils/helper';
import dayjs from 'dayjs';

export async function generate(ctx: GContext) {
  const { dao } = ctx;
  const outDir = ctx.userConfig.outDir;

  const routes = dao.getRoutes();
  const { server, serverAddress } = await createServer(ctx, {});

  fs.emptydirSync(outDir);
  await fs.copy(ctx.resolveGuguRoot('dist/client'), outDir);

  for (const url of ['/sitemap.xml', ...routes]) {
    const html = await axios
      .get(`${serverAddress}${encodeURI(url)}`)
      .then((resp) => resp.data)
      .catch((e) => {
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

  // TODO 兼容老链接, @start 2021-08-08
  await promiseQueue(
    dao.getAvailablePosts().map(async (p) => {
      const filePath = path.join(
        outDir,
        `/${dayjs(p.date).format('YYYY-MM-DD')}/${p.id}.html`,
      );
      const finalUrl = new URL(`/post/${p.id}`, ctx.userConfig.url).href;
      fs.outputFileSync(
        filePath,
        `<head><meta http-equiv="Refresh" content="0; URL=${finalUrl}" /></head>`,
        {
          encoding: 'utf-8',
        },
      );
    }),
  );

  server.close();
}
