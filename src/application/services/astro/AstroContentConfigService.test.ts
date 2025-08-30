import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { generateAstroConfig, type Options } from './AstroContentConfigService';

const testOutputDir = path.join(__dirname, `__tmp__`);
const mockDir = path.join(__dirname, `../../../../__mocks__`);

describe(`AstroContentConfigService`, () => {
  beforeEach(() => {
    // Create temp directory for test outputs
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test outputs
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe(`generateAstroConfig`, () => {
    test(`should generate basic Astro config from Sveltia config`, () => {
      const options: Options = {
        sveltiaConfigPath: path.join(mockDir, `basic-config.yml`),
        astroContentConfigPath: path.join(testOutputDir, `config.ts`),
      };

      // Mock console.log to capture output
      const originalLog = console.info;
      const logMessages: string[] = [];
      console.info = (...args: string[]) => {
        logMessages.push(args.join(` `));
      };

      generateAstroConfig(options);

      // Restore console.log
      console.info = originalLog;

      // Check that the file was created
      expect(fs.existsSync(options.astroContentConfigPath)).toBe(true);

      // Read and verify the generated content
      const generatedContent = fs.readFileSync(
        options.astroContentConfigPath,
        `utf8`,
      );

      // Check for expected imports
      expect(generatedContent).toContain(
        `import { defineCollection, z, reference } from "astro:content"`,
      );
      expect(generatedContent).toContain(
        `import { glob } from "astro/loaders"`,
      );

      // Check for collections
      expect(generatedContent).toContain(`const blog =`);
      expect(generatedContent).toContain(`const pages =`);

      // Check for glob patterns
      expect(generatedContent).toContain(`pattern: "**/*.md"`);
      expect(generatedContent).toContain(`base: "content/blog"`);
      expect(generatedContent).toContain(`base: "content/pages"`);

      // Check for schema fields
      expect(generatedContent).toContain(`title: z.string()`);
      expect(generatedContent).toContain(`date: z.coerce.date()`);
      expect(generatedContent).toContain(`body: z.string()`);
      expect(generatedContent).toContain(`featured: z.boolean()`);
      expect(generatedContent).toContain(`slug: z.string()`);

      // Check for exports
      expect(generatedContent).toContain(
        `export const collections = { blog, pages }`,
      );

      // Check console output
      expect(
        logMessages.some((msg) => msg.includes(`Successfully generated`)),
      ).toBe(true);
      expect(
        logMessages.some((msg) => msg.includes(`Generated 2 collection(s)`)),
      ).toBe(true);
    });

    test(`should generate Astro config with i18n support`, () => {
      const options: Options = {
        sveltiaConfigPath: path.join(mockDir, `i18n-config.yml`),
        astroContentConfigPath: path.join(testOutputDir, `i18n-config.ts`),
      };

      // Mock console.log
      const originalLog = console.info;
      const logMessages: string[] = [];
      console.info = (...args: string[]) => {
        logMessages.push(args.join(` `));
      };

      generateAstroConfig(options);

      // Restore console.log
      console.info = originalLog;

      const generatedContent = fs.readFileSync(
        options.astroContentConfigPath,
        `utf8`,
      );

      // Check for locale-specific collections
      expect(generatedContent).toContain(`const blog_en =`);
      expect(generatedContent).toContain(`const blog_fr =`);
      expect(generatedContent).toContain(`const blog_de =`);
      expect(generatedContent).toContain(`const pages_en =`);
      expect(generatedContent).toContain(`const pages_fr =`);
      expect(generatedContent).toContain(`const pages_de =`);

      // Check for locale-specific base paths
      expect(generatedContent).toContain(`base: "content/blog/en"`);
      expect(generatedContent).toContain(`base: "content/blog/fr"`);
      expect(generatedContent).toContain(`base: "content/blog/de"`);

      // Check exports include all localized collections
      expect(generatedContent).toContain(
        `blog_en, blog_fr, blog_de, pages_en, pages_fr, pages_de`,
      );

      // Check console output for i18n info
      expect(
        logMessages.some((msg) =>
          msg.includes(`Found 3 locale(s): en, fr, de`),
        ),
      ).toBe(true);
    });

    test(`should generate Astro config with path prefix`, () => {
      const options: Options = {
        sveltiaConfigPath: path.join(mockDir, `basic-config.yml`),
        astroContentConfigPath: path.join(testOutputDir, `prefixed-config.ts`),
        collectionBasePathPrefix: `src/content`,
      };

      generateAstroConfig(options);

      const generatedContent = fs.readFileSync(
        options.astroContentConfigPath,
        `utf8`,
      );

      // Check for prefixed base paths
      expect(generatedContent).toContain(`base: "src/content/content/blog"`);
      expect(generatedContent).toContain(`base: "src/content/content/pages"`);
    });

    test(`should handle complex widget types`, () => {
      const options: Options = {
        sveltiaConfigPath: path.join(mockDir, `complex-widgets-config.yml`),
        astroContentConfigPath: path.join(testOutputDir, `complex-config.ts`),
      };

      generateAstroConfig(options);

      const generatedContent = fs.readFileSync(
        options.astroContentConfigPath,
        `utf8`,
      );

      // Check for various widget types
      expect(generatedContent).toContain(`title: z.string()`);
      expect(generatedContent).toContain(`price: z.number()`);
      expect(generatedContent).toContain(`description: z.string()`);
      expect(generatedContent).toContain(`available: z.boolean()`);
      expect(generatedContent).toContain(`releaseDate: z.coerce.date()`);

      // Check for specific widget mappings
      expect(generatedContent).toContain(`images: z.string()`); // image widget
      expect(generatedContent).toContain(
        `category: z.enum(["electronics", "clothing", "books"])`,
      ); // select widget
      expect(generatedContent).toContain(`tags: z.array(z.string())`); // list widget
      expect(generatedContent).toContain(`color: z.string()`); // color widget
      expect(generatedContent).toContain(`code: z.string()`); // code widget
      expect(generatedContent).toContain(`uuid: z.string()`); // uuid widget
    });

    test(`should create output directory if it does not exist`, () => {
      const nestedDir = path.join(testOutputDir, `nested`, `deep`, `directory`);
      const options: Options = {
        sveltiaConfigPath: path.join(mockDir, `basic-config.yml`),
        astroContentConfigPath: path.join(nestedDir, `config.ts`),
      };

      expect(fs.existsSync(nestedDir)).toBe(false);

      generateAstroConfig(options);

      expect(fs.existsSync(nestedDir)).toBe(true);
      expect(fs.existsSync(options.astroContentConfigPath)).toBe(true);
    });

    test(`should throw error for non-existent input file`, () => {
      const options: Options = {
        sveltiaConfigPath: path.join(mockDir, `non-existent.yml`),
        astroContentConfigPath: path.join(testOutputDir, `config.ts`),
      };

      // Mock console.error and process.exit
      const originalError = console.error;
      const originalExit = process.exit;
      let errorMessage = ``;
      let exitCode: number | undefined;

      console.error = (msg: string) => {
        errorMessage = msg;
      };

      process.exit = ((code: number) => {
        exitCode = code;
        throw new Error(`process.exit(${code})`);
      }) as never;

      expect(() => generateAstroConfig(options)).toThrow(`process.exit(1)`);
      expect(errorMessage).toContain(`ENOENT`);
      expect(exitCode).toBe(1);

      // Restore
      console.error = originalError;
      process.exit = originalExit;
    });

    test(`should throw error for invalid config structure`, () => {
      const options: Options = {
        sveltiaConfigPath: path.join(mockDir, `invalid-config.yml`),
        astroContentConfigPath: path.join(testOutputDir, `config.ts`),
      };

      // Mock console.error and process.exit
      const originalError = console.error;
      const originalExit = process.exit;
      let errorMessage = ``;
      let exitCode: number | undefined;

      console.error = (msg: string) => {
        errorMessage = msg;
      };

      process.exit = ((code: number) => {
        exitCode = code;
        throw new Error(`process.exit(${code})`);
      }) as never;

      expect(() => generateAstroConfig(options)).toThrow(`process.exit(1)`);
      expect(errorMessage).toContain(`Error`);
      expect(exitCode).toBe(1);

      // Restore
      console.error = originalError;
      process.exit = originalExit;
    });
  });
});
