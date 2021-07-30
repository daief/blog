export function randomId() {
  return `${Date.now()}_${((1 + Math.random()) * 0x100000) | 0}`;
}
