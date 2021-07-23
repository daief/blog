import { fromBase64, toBase64 } from './decode';

export function stringifyParams(p: any): string {
  const sorted = Object.keys(p)
    .sort()
    .reduce((r, k) => ((r[k] = p[k]), r), {} as any);
  return toBase64(JSON.stringify(sorted));
}

export function parseParams<T>(s: string, defaultValue?: T): T {
  try {
    return JSON.parse(fromBase64(s));
  } catch (error) {
    return defaultValue;
  }
}
