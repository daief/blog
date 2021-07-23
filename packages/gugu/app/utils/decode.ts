export function toBase64(str: string) {
  if (!import.meta.env.SSR) {
    return btoa(str);
  }
  return Buffer.from(str).toString('base64');
}

export function fromBase64(str: string) {
  if (!import.meta.env.SSR) {
    return atob(str);
  }
  return Buffer.from(str, 'base64').toString();
}
