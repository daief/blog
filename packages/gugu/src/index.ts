import { GContext, IGContextOptions } from './ctx';

export async function init(opts: IGContextOptions) {
  const ctx = new GContext(opts);
  await ctx.init();
  return ctx;
}
