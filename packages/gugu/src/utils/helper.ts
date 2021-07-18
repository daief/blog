import crypto from 'crypto';

export function md5(str: string) {
  return crypto.createHash('sha256').update(str).digest('hex');
}
