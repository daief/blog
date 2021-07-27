import { encodeURL, decode } from 'js-base64';

export function toBase64(str: string) {
  return encodeURL(str);
}

export function fromBase64(str: string) {
  return decode(str);
}
