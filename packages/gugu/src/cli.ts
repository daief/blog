import cac from 'cac';
import { ICreateServerOptions, createServer } from './createServer';
import { init } from './index';
import { build } from './build';

const cli = cac('gugu');

cli
  .command('[root]') // default command
  .alias('dev')
  .option('--port <port>', `[number] specify port`)
  .action(async (root: string, options: ICreateServerOptions) => {
    process.env.NODE_ENV = 'development';
    try {
      const gCtx = await init();
      await createServer(gCtx, options);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });

cli.command('build').action(async (root: string, options: {}) => {
  process.env.NODE_ENV = 'production';

  try {
    const gCtx = await init();
    await build(gCtx, options);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

cli.command('serve').action(async (root: string, options: {}) => {
  process.env.NODE_ENV = 'production';
  try {
    const gCtx = await init();
    await createServer(gCtx, options);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

cli.help();
cli.version(require('../package.json').version);
cli.parse();
