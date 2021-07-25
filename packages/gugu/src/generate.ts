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

  const tags = dao
    .getTagList()
    .map((tag) => {
      return paginationUtil(
        dao.getPostList({ tag: tag.name }).totalPages,
        `/tags/${encodeURIComponent(tag.name)}/%d`,
        1,
      );
    })
    .flat();

  const cats = dao
    .getTagList()
    .map((cat) => {
      return paginationUtil(
        dao.getPostList({ category: cat.name }).totalPages,
        `/categories/${encodeURIComponent(cat.name)}/%d`,
        1,
      );
    })
    .flat();

  const routes = [
    // 文章分页
    ...paginationUtil(dao.getAvailablePosts().length, '/page/%d'),
    // 文章详情
    ...dao.getAvailablePosts().map((it) => it.path),

    '/tags',
    ...tags,

    '/categories',
    ...cats,

    ...dao.getSimplePages().map((it) => it.path),

    '/', // 最后
  ];

  const { server, serverAddress } = await createServer(ctx, {});

  fs.emptydirSync(outDir);
  await fs.copy(ctx.resolveGuguRoot('dist/client'), outDir);

  for (const url of routes) {
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
    console.log('✨ Pre-Rendered:', url);
  }

  server.close();
}
