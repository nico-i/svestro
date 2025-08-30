import { describe, test, expect } from 'bun:test';
import { StringWidget } from './StringWidget';
import { NumberWidget } from './NumberWidget';
import { BooleanWidget } from './BooleanWidget';
import { DateTimeWidget } from './DateTimeWidget';
import { MarkdownWidget } from './MarkdownWidget';
import { ListWidget } from './ListWidget';
import { SelectWidget } from './SelectWidget';
import { ImageWidget } from './ImageWidget';
import { FileWidget } from './FileWidget';
import { CodeWidget } from './CodeWidget';
import { ColorWidget } from './ColorWidget';
import { UUIDWidget } from './UuidWidget';
import { RelationWidget } from './RelationWidget';

describe(`Widget Classes`, () => {
  describe(`StringWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new StringWidget(`title`, true);
      expect(widget.zodSchemaAsString).toBe(`z.string()`);
      expect(widget.name).toBe(`title`);
      expect(widget.required).toBe(true);
    });

    test(`should create correct zod schema when optional`, () => {
      const widget = new StringWidget(`subtitle`, false);
      expect(widget.zodSchemaAsString).toBe(`z.string().nullable().optional()`);
      expect(widget.required).toBe(false);
    });
  });

  describe(`NumberWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new NumberWidget(`price`, true);
      expect(widget.zodSchemaAsString).toBe(`z.number()`);
      expect(widget.name).toBe(`price`);
    });

    test(`should create correct zod schema when optional`, () => {
      const widget = new NumberWidget(`discount`, false);
      expect(widget.zodSchemaAsString).toBe(`z.number().nullable().optional()`);
    });
  });

  describe(`BooleanWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new BooleanWidget(`featured`, true);
      expect(widget.zodSchemaAsString).toBe(`z.boolean()`);
      expect(widget.name).toBe(`featured`);
    });

    test(`should create correct zod schema when optional`, () => {
      const widget = new BooleanWidget(`archived`, false);
      expect(widget.zodSchemaAsString).toBe(
        `z.boolean().nullable().optional()`,
      );
    });
  });

  describe(`DateTimeWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new DateTimeWidget(`publishDate`, true);
      expect(widget.zodSchemaAsString).toBe(`z.coerce.date()`);
      expect(widget.name).toBe(`publishDate`);
    });

    test(`should create correct zod schema when optional`, () => {
      const widget = new DateTimeWidget(`updatedAt`, false);
      expect(widget.zodSchemaAsString).toBe(
        `z.union([z.string().transform((val) => (val === "" ? undefined : new Date(val))), z.date()]).optional()`,
      );
    });
  });

  describe(`MarkdownWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new MarkdownWidget(`content`, true);
      expect(widget.zodSchemaAsString).toBe(`z.string()`);
      expect(widget.name).toBe(`content`);
    });
  });

  describe(`ListWidget`, () => {
    test(`should create correct zod schema for simple list`, () => {
      const stringWidget = new StringWidget(`tag`, true);
      const widget = new ListWidget(`tags`, [stringWidget]);
      expect(widget.zodSchemaAsString).toBe(
        `z.array(z.string()).nullable().optional()`,
      );
      expect(widget.name).toBe(`tags`);
    });

    test(`should create correct zod schema for complex list`, () => {
      const titleWidget = new StringWidget(`title`, true);
      const urlWidget = new StringWidget(`url`, true);
      const widget = new ListWidget(`links`, [titleWidget, urlWidget]);
      expect(widget.zodSchemaAsString).toBe(
        `z.array(z.object({title: z.string(), url: z.string()})).nullable().optional()`,
      );
    });
  });

  describe(`SelectWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new SelectWidget(
        `category`,
        true,
        `z.enum(["tech", "lifestyle"])`,
      );
      expect(widget.zodSchemaAsString).toBe(`z.enum(["tech", "lifestyle"])`);
      expect(widget.name).toBe(`category`);
    });

    test(`should create correct zod schema when optional`, () => {
      const widget = new SelectWidget(
        `status`,
        false,
        `z.enum(["draft", "published"])`,
      );
      expect(widget.zodSchemaAsString).toBe(
        `z.enum(["draft", "published"]).nullable().optional()`,
      );
    });
  });

  describe(`ImageWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new ImageWidget(`coverImage`, true);
      expect(widget.zodSchemaAsString).toBe(`z.string()`);
      expect(widget.name).toBe(`coverImage`);
    });
  });

  describe(`FileWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new FileWidget(`attachment`, true);
      expect(widget.zodSchemaAsString).toBe(`z.string()`);
      expect(widget.name).toBe(`attachment`);
    });
  });

  describe(`CodeWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new CodeWidget(`snippet`, true);
      expect(widget.zodSchemaAsString).toBe(`z.string()`);
      expect(widget.name).toBe(`snippet`);
    });
  });

  describe(`ColorWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new ColorWidget(`themeColor`, true);
      expect(widget.zodSchemaAsString).toBe(`z.string()`);
      expect(widget.name).toBe(`themeColor`);
    });
  });

  describe(`UUIDWidget`, () => {
    test(`should create correct zod schema when required`, () => {
      const widget = new UUIDWidget(`id`, true);
      expect(widget.zodSchemaAsString).toBe(`z.string().uuid()`);
      expect(widget.name).toBe(`id`);
    });

    test(`should create correct zod schema when optional`, () => {
      const widget = new UUIDWidget(`externalId`, false);
      expect(widget.zodSchemaAsString).toBe(
        `z.string().uuid().nullable().optional()`,
      );
    });
  });

  describe(`RelationWidget`, () => {
    test(`should create correct zod schema for single relation when required`, () => {
      const widget = new RelationWidget(`author`, true, false, `authors`);
      expect(widget.zodSchemaAsString).toBe(`reference("authors")`);
      expect(widget.name).toBe(`author`);
    });

    test(`should create correct zod schema for multiple relations when required`, () => {
      const widget = new RelationWidget(`tags`, true, true, `tags`);
      expect(widget.zodSchemaAsString).toBe(`z.array(reference("tags"))`);
    });

    test(`should create correct zod schema when optional`, () => {
      const widget = new RelationWidget(`category`, false, false, `categories`);
      expect(widget.zodSchemaAsString).toBe(
        `reference("categories").nullable().optional()`,
      );
    });
  });
});
