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

chokidar.watch(['vite.config.ts', 'packages/gugu2/src']).on('change', () => {
  console.log('Config changed, restarting vite...');
  restart();
});

start();
