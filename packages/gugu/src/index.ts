export { dev } from './dev';

import fs from 'fs-extra';
import { GContext } from './ctx';

export async function init() {
  const ctx = new GContext();
  await ctx.init();
  return ctx;
}
