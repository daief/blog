#!/usr/bin/env node

const { register } = require('esbuild-register/dist/node');

register({
  target: `node${process.version.slice(1)}`,
  define: {
    'import.meta.env.SSR': 'true',
  },
});
require('../src/cli');

// const { init, dev } = require('../src/cli');

// (async () => {
//   const ctx = await init();
//   dev(ctx);
// })();
