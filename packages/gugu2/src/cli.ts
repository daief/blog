import { build } from 'vite';
import { execSync } from 'child_process';
import path from 'path';

execSync(`pnpm vite --config ${path.resolve(__dirname, '../vite.config.ts')}`, {
  cwd: process.cwd(),
});
