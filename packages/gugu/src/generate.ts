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
        `/tags/${tag.name}/%d`,
        1,
      );
    })
    .flat();

  const cats = dao
    .getCategoryList()
    .map((cat) => {
      return paginationUtil(
        dao.getPostList({ category: cat.name }).totalPages,
        `/categories/${cat.name}/%d`,
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

    '/404',
    '/404.html',

    '/', // 最后
  ];

  const { server, serverAddress } = await createServer(ctx, {});

  fs.emptydirSync(outDir);
  await fs.copy(ctx.resolveGuguRoot('dist/client'), outDir);

  for (const url of routes) {
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
