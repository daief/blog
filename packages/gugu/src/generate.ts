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
  const { db } = ctx;
  const outDir = path.resolve(ctx.dirs.userRoot, 'dist');

  const manifest = require(ctx.resolveGuguRoot('dist/client/manifest.json'));

  const template = fs.readFileSync(
    ctx.resolveGuguRoot('dist/client/index.html'),
    'utf-8',
  );

  const { render } = require(ctx.resolveGuguRoot(
    'dist/server/entry-server.js',
  ));

  const routes = [
    '/',
    ...paginationUtil(db._.get('posts').size().value(), '/page/%d'),
  ];

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
    fs.mkdirpSync(path.dirname(filePath));
    fs.writeFileSync(filePath, html, {
      encoding: 'utf-8',
    });
    console.log('pre-rendered:', filePath);
  }

  server.close();
}
