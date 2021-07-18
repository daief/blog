#!/usr/bin/env node

require('esbuild-register');

const { init, dev } = require('../src/index');

(async () => {
  const ctx = await init();
  dev(ctx);
})();
