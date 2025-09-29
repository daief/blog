import { createLogger as createViteLogger } from 'vite';

export const createLogger = (prefix: string) => {
  const logger = createViteLogger('info', {
    prefix,
  });

  const wrap =
    (logFn: any) =>
    (...args: any[]) => {
      const msg = args
        .reduce<string[]>((acc, cur) => {
          if (cur && cur.message && cur.stack) {
            acc.push([cur.message, cur.stack].join('\n'));
          } else if (cur && typeof cur === 'object') {
            acc.push(JSON.stringify(cur));
          } else {
            acc.push(cur);
          }

          return acc;
        }, [])
        .join(' ');
      logFn(msg, { timestamp: true });
    };

  return {
    info: wrap(logger.info),
    warn: wrap(logger.warn),
    error: wrap(logger.error),
  };
};

export type ILogger = ReturnType<typeof createLogger>;

export const injectLogger =
  (prefix: string) => (_: unknown, ctx: ClassFieldDecoratorContext) => {
    ctx.addInitializer(function (this: any) {
      this[ctx.name] = createLogger(prefix);
    });
  };
