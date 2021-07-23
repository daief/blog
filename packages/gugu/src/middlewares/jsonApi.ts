import { RequestHandler, Router } from 'express';
import { Response } from 'express-serve-static-core';
import { GContext } from 'src/ctx';
import fs from 'fs-extra';
import path from 'path';
import { parseParams } from '../../app/utils/api';

export function createJsonApi(ctx: GContext): RequestHandler {
  const router = Router();
  const sendJson = (
    res: Response<any, Record<string, any>, number>,
    json: any,
  ) => {
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
      pageSize: 10,
      tag: '',
      category: '',
    });

    sendJson(
      res,
      ctx.dao.getPostList({
        ...params,
        current: +params.current || 1,
        pageSize: +params.pageSize || 10,
      }),
    );
  });

  router.use('/post/detail/:id.json', (req, res) => {
    const { id } = req.params;

    sendJson(
      res,
      ctx.dao.getPostDetail({
        id,
      }),
    );
  });

  return router;
}
