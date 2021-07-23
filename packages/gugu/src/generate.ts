import path from 'path';
import { GContext } from './ctx';
import fs from 'fs-extra';
import { createServer } from './createServer';
import axios from 'axios';

function paginationUtil(length: number, pathPattern: string, perPage = 10) {
  const totalPage = perPage ? Math.ceil(length / perPage) : 1;
  return [...Array(totalPage).keys()].map((no) =>
    pathPattern.replace(/\%d/g, `${no + 1}`),
  );
}

export async function generate(ctx: GContext) {
  const { dao } = ctx;
  const outDir = ctx.userConfig.outDir;

  const routes = ['/', ...paginationUtil(43, '/page/%d')];

  const { server, serverAddress } = await createServer(ctx, {});

  fs.emptydirSync(outDir);
  await fs.copy(ctx.resolveGuguRoot('dist/client'), outDir);

  for await (const url of routes) {
    const html = await axios
      .get(`${serverAddress}${url}`)
      .then((resp) => resp.data);

    const filePath = path.resolve(
      outDir,
      `${url === '/' ? '' : url}/index.html`.replace(/^\/?/, ''),
    );
    fs.outputFileSync(filePath, html, {
      encoding: 'utf-8',
    });
    console.log('pre-rendered:', filePath);
  }

  server.close();
}
