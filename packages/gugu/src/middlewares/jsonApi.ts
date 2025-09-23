import { RequestHandler, Router } from 'express';
import { Response } from 'express';
import { GContext } from 'src/ctx';
import fs from 'fs-extra';
import path from 'path';
import { parseParams } from '../../app/utils/api';

export function createJsonApi(ctx: GContext): RequestHandler {
  const router = Router();
  const sendJson = (res: Response, json: any) => {
    if (ctx.command === 'generate') {
      fs.outputFileSync(
        path.resolve(
          ctx.userConfig.outDir,
          res.req.baseUrl.replace(/^\/?/, ''),
        ),
        JSON.stringify(json),
      );
    }

    res.json(json);
  };

  router.use('/post/list/:paramStr.json', (req, res) => {
    const params = parseParams(req.params.paramStr, {
      current: 1,
      pageSize: ctx.dao.PageSize,
      tag: '',
      category: '',
    });

    sendJson(
      res,
      ctx.dao.getPostList({
        ...params,
        current: +params.current || 1,
        pageSize: +params.pageSize || ctx.dao.PageSize,
      }),
    );
  });

  router.use('/post/detail/:id.json', (req, res) => {
    const { id } = req.params;
    const json = ctx.dao.getPostDetail({
      id,
    });

    if (!json) {
      return res.sendStatus(404);
    }

    sendJson(res, json);
  });

  router.use('/simplepage/content/:paramStr.json', (req, res) => {
    const { paramStr } = req.params;

    const params = parseParams(paramStr, {
      path: '',
    });

    const json = ctx.dao.getSimpleContentByPath(params.path);
    if (!json) {
      return res.sendStatus(404);
    }

    sendJson(res, json);
  });

  router.use('/tag/list/data.json', (req, res) => {
    const json = ctx.dao.getTagList();
    sendJson(res, json);
  });

  router.use('/category/list/data.json', (req, res) => {
    const json = ctx.dao.getCategoryList();
    sendJson(res, json);
  });

  return router;
}
