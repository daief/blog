import crypto from 'crypto';

export function md5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}
