type Newable<TInstance = unknown, TArgs extends unknown[] = any[]> = new (
  ...args: TArgs
) => TInstance;

const container = new Map<Newable<any>, any>();

export function getService<T>(cls: Newable<T>): T {
  if (!container.has(cls)) {
    const ins = new cls();
    container.set(cls, ins);
    Promise.resolve().then(() => {
      // @ts-expect-error service created life hook
      ins.onCreated?.();
    });
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

export interface IService {
  onCreated?(): void;
}
