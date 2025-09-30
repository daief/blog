type Newable<TInstance = unknown, TArgs extends unknown[] = any[]> = new (
  ...args: TArgs
) => TInstance;

const container = new Map<Newable<any>, any>();

export function getService<T>(cls: Newable<T>): T {
  if (!container.has(cls)) {
    container.set(cls, new cls());
  }

  return container.get(cls);
}

export const injectService =
  (getCls: () => Newable) =>
  (_: unknown, ctx: ClassFieldDecoratorContext<any, any>) => {
    ctx.addInitializer(function (this: any) {
      Object.defineProperty(this, ctx.name, {
        get: () => getService(getCls()),
      });
    });
  };
