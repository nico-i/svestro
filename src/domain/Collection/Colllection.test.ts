import { describe, test, expect } from 'bun:test';
import { Collection } from './Collection';

describe(`Collection`, () => {
  describe(`fromSveltiaConfigCollection`, () => {
    test(`should create Collection from valid Sveltia config`, () => {
      const sveltiaCollection = {
        name: `blog`,
        folder: `content/blog`,
        fields: [
          { name: `title`, widget: `string` },
          { name: `date`, widget: `datetime` },
          { name: `body`, widget: `markdown` },
        ],
      };

      const collection =
        Collection.fromSveltiaConfigCollection(sveltiaCollection);

      expect(collection.name).toBe(`blog`);
      expect(collection).toBeInstanceOf(Collection);
    });

    test(`should create Collection with path prefix`, () => {
      const sveltiaCollection = {
        name: `pages`,
        folder: `content/pages`,
        fields: [
          { name: `title`, widget: `string` },
          { name: `content`, widget: `markdown` },
        ],
      };

      const collection = Collection.fromSveltiaConfigCollection(
        sveltiaCollection,
        `src/content`,
      );

      const definition = collection.getAstroCollectionDefinition();
      expect(definition).toContain(`base: "src/content/content/pages"`);
    });

    test(`should throw error for missing name property`, () => {
      const sveltiaCollection = {
        folder: `content/blog`,
        fields: [{ name: `title`, widget: `string` }],
      };

      expect(() => {
        Collection.fromSveltiaConfigCollection(sveltiaCollection);
      }).toThrow(`Invalid collection configuration, missing 'name' property`);
    });

    test(`should throw error for invalid name property`, () => {
      const sveltiaCollection = {
        name: ``,
        folder: `content/blog`,
        fields: [{ name: `title`, widget: `string` }],
      };

      expect(() => {
        Collection.fromSveltiaConfigCollection(sveltiaCollection);
      }).toThrow(`invalid 'name' property`);
    });

    test(`should throw error for missing folder property`, () => {
      const sveltiaCollection = {
        name: `blog`,
        fields: [{ name: `title`, widget: `string` }],
      };

      expect(() => {
        Collection.fromSveltiaConfigCollection(sveltiaCollection);
      }).toThrow(`missing 'folder' property`);
    });

    test(`should throw error for invalid folder property`, () => {
      const sveltiaCollection = {
        name: `blog`,
        folder: ``,
        fields: [{ name: `title`, widget: `string` }],
      };

      expect(() => {
        Collection.fromSveltiaConfigCollection(sveltiaCollection);
      }).toThrow(`invalid 'folder' property`);
    });

    test(`should throw error for missing fields property`, () => {
      const sveltiaCollection = {
        name: `blog`,
        folder: `content/blog`,
      };

      expect(() => {
        Collection.fromSveltiaConfigCollection(sveltiaCollection);
      }).toThrow(`missing 'fields' property`);
    });

    test(`should throw error for invalid fields property`, () => {
      const sveltiaCollection = {
        name: `blog`,
        folder: `content/blog`,
        fields: `not-an-array`,
      };

      expect(() => {
        Collection.fromSveltiaConfigCollection(sveltiaCollection);
      }).toThrow(`invalid 'fields' property`);
    });
  });

  describe(`getAstroCollectionDefinition`, () => {
    test(`should generate correct Astro collection definition without locale`, () => {
      const sveltiaCollection = {
        name: `blog`,
        folder: `content/blog`,
        fields: [
          { name: `title`, widget: `string` },
          { name: `date`, widget: `datetime` },
          { name: `featured`, widget: `boolean` },
        ],
      };

      const collection =
        Collection.fromSveltiaConfigCollection(sveltiaCollection);
      const definition = collection.getAstroCollectionDefinition();

      expect(definition).toContain(`defineCollection({`);
      expect(definition).toContain(`loader: glob({`);
      expect(definition).toContain(`pattern: "**/*.md"`);
      expect(definition).toContain(`base: "content/blog"`);
      expect(definition).toContain(`schema:`);
      expect(definition).toContain(`z.object({`);
      expect(definition).toContain(`title: z.string()`);
      expect(definition).toContain(`date: z.coerce.date()`);
      expect(definition).toContain(`featured: z.boolean()`);
    });

    test(`should generate correct Astro collection definition with locale`, () => {
      const sveltiaCollection = {
        name: `blog`,
        folder: `content/blog`,
        fields: [
          { name: `title`, widget: `string` },
          { name: `content`, widget: `markdown` },
        ],
      };

      const collection =
        Collection.fromSveltiaConfigCollection(sveltiaCollection);
      const definition = collection.getAstroCollectionDefinition(`en`);

      expect(definition).toContain(`base: "content/blog/en"`);
    });

    test(`should generate correct definition with path prefix and locale`, () => {
      const sveltiaCollection = {
        name: `blog`,
        folder: `content/blog`,
        fields: [{ name: `title`, widget: `string` }],
      };

      const collection = Collection.fromSveltiaConfigCollection(
        sveltiaCollection,
        `src`,
      );
      const definition = collection.getAstroCollectionDefinition(`fr`);

      expect(definition).toContain(`base: "src/content/blog/fr"`);
    });
  });
});
