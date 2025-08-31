#!/usr/bin/env node

import { cli } from '@/presentation/cli/cli';
import chalk from 'chalk';

// Only run if this file is executed directly
if (import.meta.main) {
  cli().catch((error) => {
    // Check if the error is due to user interruption
    if (
      error?.code === `SIGINT` ||
      error?.message?.includes(`User force closed`)
    ) {
      console.info(
        chalk.yellow(`\n\n👋 Operation cancelled by user. Goodbye!`),
      );
      process.exit(0);
    }

    console.error(chalk.red(`❌ Unexpected error: ${error?.message || error}`));

    // Log stack trace in debug mode or if needed
    if (process.env.DEBUG) {
      console.error(chalk.gray(error?.stack));
    }

    process.exit(1);
  });
}
