// watch-vite.js
import { spawn } from 'child_process';
import chokidar from 'chokidar';
import kill from 'tree-kill';

/**
 * @type {import('child_process').ChildProcess}
 */
let vite;

function start() {
  vite = spawn('pnpm', ['vite', 'dev', '--configLoader', 'native'], {
    stdio: 'inherit',
  });
}

async function restart() {
  if (vite) {
    kill(vite.pid, 'SIGKILL', () => {
      console.log('Old vite killed');
      start();
    });
  } else {
    start();
  }
}

let timmer;
chokidar
  .watch([
    'vite.config.ts',
    'packages/gugu/src',
    'packages/gugu/types',
    'packages/gugu/app/templates',
  ])
  .on('change', () => {
    clearTimeout(timmer);
    timmer = setTimeout(() => {
      console.log('Config changed, restarting vite...');
      restart();
    }, 1000);
  });

start();
