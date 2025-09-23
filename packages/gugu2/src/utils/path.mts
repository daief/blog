import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export function getFilename(path: string, ...rest: string[]) {
  const v = fileURLToPath(path);
  if (!rest.length) return v;
  return resolve(v, ...rest);
}

export function getDirname(path: string, ...rest: string[]) {
  const v = dirname(getFilename(path));
  if (!rest.length) return v;
  return resolve(v, ...rest);
}
