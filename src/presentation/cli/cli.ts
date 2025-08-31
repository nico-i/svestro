import {
  generateAstroConfig,
  type Options,
} from '@/application/services/astro/AstroContentConfigService';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';

// Setup signal handlers for graceful shutdown
export function setupSignalHandlers(): void {
  const gracefulShutdown = (signal: string) => {
    console.warn(
      chalk.yellow(`\n\n⚠️  Received ${signal}. Exiting gracefully...`),
    );
    process.exit(0);
  };

  // Handle Ctrl+C (SIGINT)
  process.on(`SIGINT`, () => gracefulShutdown(`SIGINT`));

  // Handle termination signal (SIGTERM)
  process.on(`SIGTERM`, () => gracefulShutdown(`SIGTERM`));

  // Handle uncaught exceptions
  process.on(`uncaughtException`, (error) => {
    console.error(chalk.red(`\n❌ Uncaught exception: ${error.message}`));
    console.error(chalk.gray(error.stack));
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on(`unhandledRejection`, (reason) => {
    console.error(chalk.red(`\n❌ Unhandled rejection: ${reason}`));
    process.exit(1);
  });
}

async function runInteractive(): Promise<void> {
  console.info(
    chalk.cyan(`🚀 Welcome to Svestro - Sveltia to Astro Config Generator\n`),
  );

  try {
    const answers = await inquirer.prompt<Options>([
      {
        type: `input`,
        name: `sveltiaConfigPath`,
        required: true,
        message: `Path to your Sveltia config file:`,
        default: `./static/admin/config.yml`,
        validate: (input: string) => {
          if (!input.trim()) {
            return `Please provide a path to the Sveltia config file`;
          }
          if (!fs.existsSync(input)) {
            return `File not found: ${input}`;
          }
          return true;
        },
      },
      {
        type: `input`,
        required: true,
        name: `astroContentConfigPath`,
        message: `Where should the Astro content config be saved?`,
        default: `./src/content/config.ts`,
      },
      {
        type: `input`,
        name: `collectionBasePathPrefix`,
        message: `Path prefix for collection base path`,
        required: false,
      },
    ]);

    generateAstroConfig({
      sveltiaConfigPath: answers.sveltiaConfigPath,
      astroContentConfigPath: answers.astroContentConfigPath,
      collectionBasePathPrefix: answers.collectionBasePathPrefix,
    });
  } catch (error) {
    // Handle interruption during interactive prompts
    if (
      error instanceof Error &&
      error.message.includes(`User force closed the prompt`)
    ) {
      console.info(chalk.yellow(`\n\n👋 Goodbye!`));
      process.exit(0);
    }
    throw error;
  }
}

export async function cli(): Promise<void> {
  // Setup signal handlers before starting the CLI
  setupSignalHandlers();

  const program = new Command();

  program
    .name(`svestro`)
    .description(
      `Generate Astro content configuration from Sveltia CMS configuration`,
    )
    .version(`1.0.0`)
    .argument(`[sveltiaConfigPath]`, `path to Sveltia config file`)
    .argument(`[astroContentConfigPath]`, `path to Astro config file`)
    .option(
      `-p, --prefix <path>`,
      `path prefix for collection base path`,
      undefined,
    )
    .action(async (sveltiaConfigPath, astroContentConfigPath, { prefix }) => {
      // If no options provided, run interactive mode
      if (!sveltiaConfigPath && !astroContentConfigPath) {
        await runInteractive();
        return;
      }

      // Validate required options for non-interactive mode
      if (!sveltiaConfigPath) {
        console.error(
          chalk.red(
            `❌ Error: --sveltiaConfigPath is required when using flags`,
          ),
        );
        process.exit(1);
      }

      if (!astroContentConfigPath) {
        console.error(
          chalk.red(
            `❌ Error: --astroContentConfigPath is required when using flags`,
          ),
        );
        process.exit(1);
      }

      // Validate input file exists
      if (!fs.existsSync(sveltiaConfigPath)) {
        console.error(
          chalk.red(`❌ Error: Input file not found: ${sveltiaConfigPath}`),
        );
        process.exit(1);
      }

      generateAstroConfig({
        sveltiaConfigPath: sveltiaConfigPath,
        astroContentConfigPath: astroContentConfigPath,
        collectionBasePathPrefix: prefix,
      });
    });

  program.parse();
}
