import cac from 'cac';
import { ICreateServerOptions, createServer } from './createServer';
import { init } from './index';
import { build } from './build';
import { generate } from './generate';
import chokidar, { FSWatcher } from 'chokidar';

const cli = cac('gugu');

async function wrapAction(isProd: boolean, logic: () => void) {
  process.env.NODE_ENV = isProd ? 'production' : 'development';
  try {
    await logic();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

cli
  .command('[root]') // default command
  .alias('dev')
  .option('--port <port>', `[number] specify port`)
  .action(async (root: string, options: ICreateServerOptions) => {
    wrapAction(false, async () => {
      const gCtx = await init({ command: 'dev' });
      await createServer(gCtx, options);
    });
  });

cli.command('build').action(async (root: string, options: {}) => {
  wrapAction(true, async () => {
    const gCtx = await init({ command: 'build' });
    await build(gCtx, options);
  });
});

cli.command('serve').action(async (root: string, options: {}) => {
  wrapAction(true, async () => {
    const gCtx = await init({ command: 'serve' });
    await createServer(gCtx, options);
  });
});

cli.command('generate').action(async (root: string) => {
  wrapAction(true, async () => {
    const gCtx = await init({ command: 'generate' });
    await generate(gCtx);
  });
});

cli.help();
cli.version(require('../package.json').version);
cli.parse();
