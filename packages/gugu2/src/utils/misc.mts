import { isNil } from 'lodash-es';

export function ensureArray<T>(value: T | T[], filterNil = true): T[] {
  const arr = Array.isArray(value) ? value : [value];
  if (!filterNil) return arr;
  return arr.filter((it) => !isNil(it));
}
