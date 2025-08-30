import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { Collection } from '../../../domain/Collection/Collection';

export interface Options {
  sveltiaConfigPath: string;
  astroContentConfigPath: string;
  collectionBasePathPrefix?: string;
}

export function generateAstroConfig({
  sveltiaConfigPath,
  astroContentConfigPath,
  collectionBasePathPrefix,
}: Options): void {
  try {
    // Read and parse Sveltia config
    const sveltiaConfig = fs.readFileSync(sveltiaConfigPath, `utf8`);
    const parsedConfig = YAML.parse(sveltiaConfig);

    // Create collections
    const collections: Collection[] = parsedConfig.collections.map(
      (collection: unknown) => {
        if (typeof collection !== `object` || collection === null) {
          throw new Error(`Invalid collection configuration`);
        }
        return Collection.fromSveltiaConfigCollection(
          collection,
          collectionBasePathPrefix,
        );
      },
    );

    // Extract locales if they exist
    let locales: string[] = [];
    if (`i18n` in parsedConfig) {
      locales = parsedConfig.i18n.locales;
    }

    // Generate Astro content config
    const astroContentConfig = `
import { defineCollection, z, reference } from "astro:content";
import { glob } from "astro/loaders";

${collections
  .reduce<string[]>((acc, collection) => {
    if (locales.length > 0) {
      locales.forEach((locale) => {
        acc.push(
          `const ${collection.name}_${locale} = ${collection.getAstroCollectionDefinition(locale)};`,
        );
      });
      return acc;
    }
    acc.push(
      `const ${collection.name} = ${collection.getAstroCollectionDefinition()};`,
    );
    return acc;
  }, [])
  .join(`\n\n`)}

export const collections = { ${collections
      .reduce<string[]>((acc, collection) => {
        if (locales.length > 0) {
          locales.forEach((locale) => {
            acc.push(`${collection.name}_${locale}`);
          });
        } else {
          acc.push(collection.name);
        }
        return acc;
      }, [])
      .join(`, `)} };
`;

    // Ensure output directory exists
    const outputDir = path.dirname(astroContentConfigPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the output file
    fs.writeFileSync(astroContentConfigPath, astroContentConfig);

    console.info(
      chalk.green(
        `✅ Successfully generated Astro content config at: ${astroContentConfigPath}`,
      ),
    );
    console.info(
      chalk.blue(`📊 Generated ${collections.length} collection(s)`),
    );
    if (locales.length > 0) {
      console.info(
        chalk.blue(
          `🌍 Found ${locales.length} locale(s): ${locales.join(`, `)}`,
        ),
      );
    }
  } catch (error) {
    console.error(
      chalk.red(
        `❌ Error: ${error instanceof Error ? error.message : `Unknown error`}`,
      ),
    );
    process.exit(1);
  }
}
