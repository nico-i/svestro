import { defineConfig } from 'eslint/config';
import config from '@nico-i/eslint-config';

export default defineConfig([
  ...config,
  {
    ignores: [`node_modules/`, `out/`, `coverage/`],
  },
]);
