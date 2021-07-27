export function wait(n: number) {
  return new Promise((r) => setTimeout(r, n));
}
