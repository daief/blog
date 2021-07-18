import { RequestHandler, Router } from 'express';
import { GContext } from 'src/ctx';

export function createJsonApi(ctx: GContext): RequestHandler {
  const router = Router();

  router.use('/aaa', (req, res) => {
    res.send('xxxx');
  });

  return router;
}
