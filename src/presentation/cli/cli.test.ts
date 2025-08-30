import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { exec, type ExecException } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Test directories and files
const TEST_DIR = path.join(process.cwd(), `test-temp`);
const MOCK_DIR = path.join(__dirname, `../../../__mocks__`);
const TEST_CONFIG_PATH = path.join(TEST_DIR, `test-config.yml`);
const TEST_OUTPUT_PATH = path.join(TEST_DIR, `config.ts`);

// Mock config file paths
const BASIC_CONFIG_PATH = path.join(MOCK_DIR, `basic-config.yml`);
const COMPLEX_CONFIG_PATH = path.join(MOCK_DIR, `complex-widgets-config.yml`);
const INVALID_CONFIG_PATH = path.join(MOCK_DIR, `invalid-config.yml`);
const I18N_CONFIG_PATH = path.join(MOCK_DIR, `i18n-config.yml`);
const EMPTY_FIELDS_CONFIG_PATH = path.join(MOCK_DIR, `empty-fields-config.yml`);
const SPECIAL_NAMES_CONFIG_PATH = path.join(
  MOCK_DIR,
  `special-names-config.yml`,
);
const UNICODE_CONFIG_PATH = path.join(MOCK_DIR, `unicode-config.yml`);

// Helper function to generate large config for performance testing
function generateLargeConfig(): string {
  let largeConfig = `
backend:
  name: test-repo

collections:`;

  for (let i = 0; i < 50; i++) {
    largeConfig += `
  - name: collection${i}
    label: Collection ${i}
    folder: content/collection${i}
    fields:`;

    for (let j = 0; j < 20; j++) {
      largeConfig += `
      - { name: field${j}, label: Field ${j}, widget: string }`;
    }
  }

  return largeConfig;
}

describe(`CLI Integration Tests`, () => {
  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe(`Help and Version Commands`, () => {
    test(`should display help when --help flag is used`, async () => {
      const { stderr, stdout } = await execAsync(`bun run index.ts --help`);

      expect(stderr).toBe(``);
      expect(stdout).toContain(`svestro`);
      expect(stdout).toContain(
        `Generate Astro content configuration from Sveltia CMS configuration`,
      );
      expect(stdout).toContain(`Usage:`);
      expect(stdout).toContain(`Arguments:`);
      expect(stdout).toContain(`Options:`);
      expect(stdout).toContain(`-p, --prefix`);
      expect(stdout).toContain(`-h, --help`);
      expect(stdout).toContain(`-V, --version`);
    });

    test(`should display version when --version flag is used`, async () => {
      const { stderr, stdout } = await execAsync(`bun run index.ts --version`);

      expect(stderr).toBe(``);
      expect(stdout.trim()).toBe(`1.0.0`);
    });

    test(`should display version when -V flag is used`, async () => {
      const { stderr, stdout } = await execAsync(`bun run index.ts -V`);

      expect(stderr).toBe(``);
      expect(stdout.trim()).toBe(`1.0.0`);
    });
  });

  describe(`Non-Interactive Mode - Valid Inputs`, () => {
    test(`should successfully process basic config with positional arguments`, async () => {
      // Copy mock config file to test location
      fs.copyFileSync(BASIC_CONFIG_PATH, TEST_CONFIG_PATH);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      // Check generated content
      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).toContain(
        `import { defineCollection, z, reference } from "astro:content"`,
      );
      expect(generatedContent).toContain(
        `import { glob } from "astro/loaders"`,
      );
      expect(generatedContent).toContain(`export const collections = {`);
      expect(generatedContent).toContain(`const blog =`);
      expect(generatedContent).toContain(`const pages =`);
      expect(generatedContent).toContain(`z.string()`);
      expect(generatedContent).toContain(`z.coerce.date()`);
    });

    test(`should successfully process complex config with all widget types`, async () => {
      // Copy mock config file with complex widgets
      fs.copyFileSync(COMPLEX_CONFIG_PATH, TEST_CONFIG_PATH);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      // Check generated content includes all widget types
      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).toContain(`z.string()`); // required string
      expect(generatedContent).toContain(`z.string().nullable().optional()`); // optional string
      expect(generatedContent).toContain(`z.coerce.date()`); // datetime
      expect(generatedContent).toContain(`z.boolean()`); // boolean
      expect(generatedContent).toContain(`z.array(z.string())`); // list
      expect(generatedContent).toContain(`z.enum(`); // select enum
      expect(generatedContent).toContain(`z.number()`); // number
      expect(generatedContent).toContain(`z.string().uuid()`); // uuid
      expect(generatedContent).toContain(`reference(`); // relation
      expect(generatedContent).toContain(`defineCollection`);
    });

    test(`should apply path prefix when provided`, async () => {
      fs.copyFileSync(BASIC_CONFIG_PATH, TEST_CONFIG_PATH);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}" --prefix "src/content"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).toContain(`src/content/content/blog`);
      expect(generatedContent).toContain(`src/content/content/pages`);
    });

    test(`should work with short prefix flag -p`, async () => {
      fs.copyFileSync(BASIC_CONFIG_PATH, TEST_CONFIG_PATH);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}" -p "custom/path"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).toContain(`custom/path/content/blog`);
      expect(generatedContent).toContain(`custom/path/content/pages`);
    });

    test(`should handle i18n configurations`, async () => {
      fs.copyFileSync(I18N_CONFIG_PATH, TEST_CONFIG_PATH);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      // i18n configurations generate separate collections for each locale
      expect(generatedContent).toContain(`const blog_en =`);
      expect(generatedContent).toContain(`const blog_fr =`);
      expect(generatedContent).toContain(`const blog_de =`);
      expect(generatedContent).toContain(`const pages_en =`);
      expect(generatedContent).toContain(`const pages_fr =`);
      expect(generatedContent).toContain(`const pages_de =`);
      expect(generatedContent).toContain(`defineCollection`);
    });
  });

  describe(`Error Handling`, () => {
    test(`should show error when input file does not exist`, async () => {
      const nonExistentPath = path.join(TEST_DIR, `nonexistent.yml`);

      try {
        await execAsync(
          `bun run index.ts "${nonExistentPath}" "${TEST_OUTPUT_PATH}"`,
        );
        expect(true).toBe(false); // Should not reach here
      } catch (e: unknown) {
        const error = e as ExecException;
        expect(error.code).toBe(1);
        expect(error.stderr).toContain(`❌ Error: Input file not found:`);
        expect(error.stderr).toContain(nonExistentPath);
      }
    });

    test(`should show error when only one argument is provided`, async () => {
      fs.copyFileSync(BASIC_CONFIG_PATH, TEST_CONFIG_PATH);

      try {
        const { stderr, stdout } = await execAsync(
          `bun run index.ts "${TEST_CONFIG_PATH}"`,
        );
        // If it doesn't throw, check the output
        expect(stdout || stderr).toMatch(
          /❌ Error: --astroContentConfigPath is required when using flags/,
        );
      } catch (e: unknown) {
        const error = e as ExecException;
        // If it throws an error, check the error output
        const output = error.stdout || error.stderr || ``;
        expect(output).toMatch(
          /❌ Error: --astroContentConfigPath is required when using flags/,
        );
      }
    });

    test(`should handle invalid YAML gracefully`, async () => {
      fs.copyFileSync(INVALID_CONFIG_PATH, TEST_CONFIG_PATH);

      try {
        await execAsync(
          `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
        );
        expect(true).toBe(false); // Should not reach here
      } catch (e: unknown) {
        const error = e as ExecException;
        expect(error.code).toBe(1);
        // Should contain error about parsing or processing
        expect(error.stderr).toContain(`❌`);
      }
    });

    test(`should handle permission errors when output directory is not writable`, async () => {
      fs.copyFileSync(BASIC_CONFIG_PATH, TEST_CONFIG_PATH);

      // Try to write to root directory (should fail on most systems)
      const restrictedPath = `/root/test-output.ts`;

      try {
        await execAsync(
          `bun run index.ts "${TEST_CONFIG_PATH}" "${restrictedPath}"`,
        );
        expect(true).toBe(false); // Should not reach here on most systems
      } catch (e: unknown) {
        const error = e as ExecException;
        expect(error.code).toBe(1);
        expect(error.stderr).toContain(`❌`);
      }
    });
  });

  describe(`Output Validation`, () => {
    test(`should generate valid TypeScript syntax`, async () => {
      fs.copyFileSync(BASIC_CONFIG_PATH, TEST_CONFIG_PATH);

      await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);

      // Check for valid TypeScript/Astro content config structure
      expect(generatedContent).toMatch(
        /import\s+{\s*defineCollection,\s*z,\s*reference\s*}\s+from\s+["']astro:content["']/,
      );
      expect(generatedContent).toMatch(/export\s+const\s+collections\s*=\s*{/);
      expect(generatedContent).toMatch(/}\s*;?\s*$/);

      // Ensure proper closing of objects
      const openBraces = (generatedContent.match(/{/g) || []).length;
      const closeBraces = (generatedContent.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);
    });

    test(`should handle collections with no fields gracefully`, async () => {
      fs.copyFileSync(EMPTY_FIELDS_CONFIG_PATH, TEST_CONFIG_PATH);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).toContain(`const empty =`);
    });

    test(`should preserve collection names and convert them properly`, async () => {
      fs.copyFileSync(SPECIAL_NAMES_CONFIG_PATH, TEST_CONFIG_PATH);

      await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).toContain(`const blog-posts =`);
      expect(generatedContent).toContain(`const news_items =`);
    });
  });

  describe(`Interactive Mode`, () => {
    test(`should enter interactive mode when no arguments provided`, async () => {
      // This test is tricky because we need to simulate user input
      // We'll test that it starts the interactive mode by checking output
      const childProcess = exec(`bun run index.ts`);

      let output = ``;
      childProcess.stdout?.on(`data`, (data) => {
        output += data.toString();
      });

      // Wait a bit for the process to start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Kill the process since we can't easily simulate input
      childProcess.kill();

      expect(output).toContain(`🚀 Welcome to Svestro`);
      expect(output).toContain(`Path to your Sveltia config file:`);
    });
  });

  describe(`Edge Cases and Robustness`, () => {
    test(`should handle very large config files`, async () => {
      // Generate a large config with many collections and fields
      const largeConfig = generateLargeConfig();
      fs.writeFileSync(TEST_CONFIG_PATH, largeConfig);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).toContain(`const collection0 =`);
      expect(generatedContent).toContain(`const collection49 =`);
    });

    test(`should handle unicode characters in field names and labels`, async () => {
      fs.copyFileSync(UNICODE_CONFIG_PATH, TEST_CONFIG_PATH);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).toContain(`título:`);
      expect(generatedContent).toContain(`描述:`);
      expect(generatedContent).toContain(`emoji_field_🚀:`);
    });

    test(`should handle empty input file`, async () => {
      fs.writeFileSync(TEST_CONFIG_PATH, ``);

      try {
        await execAsync(
          `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
        );
        expect(true).toBe(false); // Should not reach here
      } catch (e: unknown) {
        const error = e as ExecException;
        expect(error.code).toBe(1);
        expect(error.stderr).toContain(`❌`);
      }
    });

    test(`should handle output to existing file (overwrite)`, async () => {
      fs.copyFileSync(BASIC_CONFIG_PATH, TEST_CONFIG_PATH);
      fs.writeFileSync(TEST_OUTPUT_PATH, `existing content`);

      const { stderr } = await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      expect(stderr).toBe(``);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);

      const generatedContent = fs.readFileSync(TEST_OUTPUT_PATH, `utf-8`);
      expect(generatedContent).not.toBe(`existing content`);
      expect(generatedContent).toContain(
        `import { defineCollection, z, reference } from "astro:content"`,
      );
    });
  });

  describe(`Performance Tests`, () => {
    test(`should complete processing within reasonable time`, async () => {
      fs.copyFileSync(BASIC_CONFIG_PATH, TEST_CONFIG_PATH);

      const startTime = Date.now();

      await execAsync(
        `bun run index.ts "${TEST_CONFIG_PATH}" "${TEST_OUTPUT_PATH}"`,
      );

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete within 10 seconds for basic config
      expect(executionTime).toBeLessThan(10000);
      expect(fs.existsSync(TEST_OUTPUT_PATH)).toBe(true);
    });
  });
});
