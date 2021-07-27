import crypto from 'crypto';

export function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * 队列执行 promise
 * @param promises
 * @returns
 */
export function promiseQueue<T>(promises: Promise<T>[]): Promise<T[]> {
  return promises.reduce((p, curr) => {
    return p.then((arr) => curr.then((r) => (arr.push(r), arr)));
  }, Promise.resolve([]));
}
