#!/usr/bin/env node

import { install } from '../src/install.js';

install().catch((err) => {
  console.error('\n  Error:', err.message || err);
  process.exit(1);
});
