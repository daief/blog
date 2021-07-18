import { RequestHandler, Router } from 'express';
import { GContext } from 'src/ctx';
import fs from 'fs-extra';
import path from 'path';

export function createJsonApi(ctx: GContext): RequestHandler {
  const router = Router();

  router.use('/aaa', (req, res) => {
    if (ctx.command === 'generate') {
      fs.outputFileSync(
        path.resolve(ctx.userConfig.outDir, 'api/aaa'),
        JSON.stringify({
          a: 'xxxx',
        }),
      );
    }
    res.send({ a: 'xxxx' });
  });

  return router;
}
