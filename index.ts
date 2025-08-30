#!/usr/bin/env node

import { cli } from '@/presentation/cli/cli';
import chalk from 'chalk';

// Only run if this file is executed directly
if (import.meta.main) {
  cli().catch((error) => {
    console.error(chalk.red(`❌ Unexpected error: ${error}`));
    process.exit(1);
  });
}
