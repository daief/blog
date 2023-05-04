import cac from 'cac';
import { ICreateServerOptions, createServer } from './createServer';
import { init } from './index';
import { build } from './build';
import { generate } from './generate';
import chokidar, { FSWatcher } from 'chokidar';
import * as path from 'path';
import dayjs from 'dayjs';
import fs from 'fs-extra';

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
  .option('--port [port]', `[number] specify port`, {
    default: 4000,
  })
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

cli
  .command('new')
  .option('--id <id>', `[string] post id`)
  .option('--name [name]', `[string] post name`)
  .action(async (options: { name: string; id: string }) => {
    wrapAction(true, async () => {
      const gCtx = await init({ command: 'new' });
      const now = dayjs();
      const postpath = path.resolve(
        gCtx.dirs.sourceDir,
        `posts/${now.year()}`,
        now.format('MMDD') + '-' + options.id + '.md',
      );
      const slices = [
        '---',
        `title: ${options.name || options.id}`,
        `id: ${options.id}`,
        `date: ${now.format('YYYY-MM-DD HH:mm:ss')}`,
        'categories: []',
        'tags:',
        'keywords:',
        '---',
      ];
      await fs.writeFile(postpath, slices.join('\n') + '\n');
    });
  });

cli.help();
cli.version(require('../package.json').version);
cli.parse();
