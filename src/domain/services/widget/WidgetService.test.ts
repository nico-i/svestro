import { describe, test, expect } from 'bun:test';
import { widgetFromSveltiaConfigField } from './WidgetService';
import { StringWidget } from '../../widgets/StringWidget';
import { NumberWidget } from '../../widgets/NumberWidget';
import { BooleanWidget } from '../../widgets/BooleanWidget';
import { DateTimeWidget } from '../../widgets/DateTimeWidget';
import { MarkdownWidget } from '../../widgets/MarkdownWidget';
import { ListWidget } from '../../widgets/ListWidget';
import { SelectWidget } from '../../widgets/SelectWidget';
import { ImageWidget } from '../../widgets/ImageWidget';
import { FileWidget } from '../../widgets/FileWidget';
import { CodeWidget } from '../../widgets/CodeWidget';
import { ColorWidget } from '../../widgets/ColorWidget';
import { UUIDWidget } from '../../widgets/UuidWidget';
import { RelationWidget } from '../../widgets/RelationWidget';

describe(`WidgetService`, () => {
  describe(`widgetFromSveltiaConfigField`, () => {
    test(`should create StringWidget for string field`, () => {
      const field = {
        name: `title`,
        widget: `string`,
        required: true,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(StringWidget);
      expect(widget.name).toBe(`title`);
      expect(widget.required).toBe(true);
    });

    test(`should create NumberWidget for number field`, () => {
      const field = {
        name: `price`,
        widget: `number`,
        required: false,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(NumberWidget);
      expect(widget.name).toBe(`price`);
      expect(widget.required).toBe(false);
    });

    test(`should create BooleanWidget for boolean field`, () => {
      const field = {
        name: `featured`,
        widget: `boolean`,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(BooleanWidget);
      expect(widget.name).toBe(`featured`);
      expect(widget.required).toBe(true); // default when not specified
    });

    test(`should create DateTimeWidget for datetime field`, () => {
      const field = {
        name: `publishDate`,
        widget: `datetime`,
        required: true,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(DateTimeWidget);
      expect(widget.name).toBe(`publishDate`);
      expect(widget.required).toBe(true);
    });

    test(`should create MarkdownWidget for markdown field`, () => {
      const field = {
        name: `content`,
        widget: `markdown`,
        required: true,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(MarkdownWidget);
      expect(widget.name).toBe(`content`);
    });

    test(`should create SelectWidget for select field with string array options`, () => {
      const field = {
        name: `category`,
        widget: `select`,
        options: [`tech`, `lifestyle`, `travel`],
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(SelectWidget);
      expect(widget.name).toBe(`category`);
      expect(widget.zodSchemaAsString).toBe(
        `z.enum(["tech", "lifestyle", "travel"])`,
      );
    });

    test(`should create SelectWidget for select field with options`, () => {
      const field = {
        name: `category`,
        widget: `select`,
        options: [
          { value: `tech` },
          { value: `lifestyle` },
          { value: `business` },
        ],
        required: true,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(SelectWidget);
      expect(widget.name).toBe(`category`);
      expect(widget.zodSchemaAsString).toContain(`z.enum`);
      expect(widget.zodSchemaAsString).toContain(`tech`);
      expect(widget.zodSchemaAsString).toContain(`lifestyle`);
      expect(widget.zodSchemaAsString).toContain(`business`);
    });

    test(`should create ImageWidget for image field`, () => {
      const field = {
        name: `coverImage`,
        widget: `image`,
        required: true,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(ImageWidget);
      expect(widget.name).toBe(`coverImage`);
    });

    test(`should create FileWidget for file field`, () => {
      const field = {
        name: `attachment`,
        widget: `file`,
        required: false,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(FileWidget);
      expect(widget.name).toBe(`attachment`);
    });

    test(`should create CodeWidget for code field`, () => {
      const field = {
        name: `snippet`,
        widget: `code`,
        required: true,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(CodeWidget);
      expect(widget.name).toBe(`snippet`);
    });

    test(`should create ColorWidget for color field`, () => {
      const field = {
        name: `themeColor`,
        widget: `color`,
        required: false,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(ColorWidget);
      expect(widget.name).toBe(`themeColor`);
    });

    test(`should create UUIDWidget for uuid field`, () => {
      const field = {
        name: `id`,
        widget: `uuid`,
        required: true,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(UUIDWidget);
      expect(widget.name).toBe(`id`);
    });

    test(`should create ListWidget for list field`, () => {
      const field = {
        name: `tags`,
        widget: `list`,
        field: { name: `tag`, widget: `string` },
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(ListWidget);
      expect(widget.name).toBe(`tags`);
    });

    test(`should create ListWidget for list field with object items`, () => {
      const field = {
        name: `authors`,
        widget: `list`,
        fields: [
          { name: `name`, widget: `string` },
          { name: `email`, widget: `string` },
        ],
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(ListWidget);
      expect(widget.name).toBe(`authors`);
      expect(widget.zodSchemaAsString).toContain(`z.object`);
      expect(widget.zodSchemaAsString).toContain(`name`);
      expect(widget.zodSchemaAsString).toContain(`email`);
    });

    test(`should create RelationWidget for relation field`, () => {
      const field = {
        name: `author`,
        widget: `relation`,
        collection: `authors`,
        search_fields: [`name`],
        value_field: `slug`,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(RelationWidget);
      expect(widget.name).toBe(`author`);
      expect(widget.zodSchemaAsString).toContain(`reference("authors")`);
    });

    test(`should create RelationWidget for multiple relation field`, () => {
      const field = {
        name: `tags`,
        widget: `relation`,
        collection: `tags`,
        multiple: true,
        search_fields: [`name`],
        value_field: `slug`,
      };

      const widget = widgetFromSveltiaConfigField(field);

      expect(widget).toBeInstanceOf(RelationWidget);
      expect(widget.name).toBe(`tags`);
      expect(widget.zodSchemaAsString).toContain(`z.array(reference("tags"))`);
    });

    test(`should throw error for missing name field`, () => {
      const field = {
        widget: `string`,
      };

      expect(() => {
        widgetFromSveltiaConfigField(field);
      }).toThrow(`Missing 'name' field`);
    });

    test(`should throw error for invalid name type`, () => {
      const field = {
        name: 123,
        widget: `string`,
      };

      expect(() => {
        widgetFromSveltiaConfigField(field);
      }).toThrow(`Invalid 'name' field`);
    });

    test(`should throw error for missing widget field`, () => {
      const field = {
        name: `title`,
      };

      expect(() => {
        widgetFromSveltiaConfigField(field);
      }).toThrow(`Missing 'widget' field`);
    });

    test(`should throw error for unsupported widget type`, () => {
      const field = {
        name: `custom`,
        widget: `unsupported`,
      };

      expect(() => {
        widgetFromSveltiaConfigField(field);
      }).toThrow(`Invalid 'widget' field`);
    });

    test(`should default required to true when not specified`, () => {
      const field = {
        name: `optional`,
        widget: `string`,
      };

      const widget = widgetFromSveltiaConfigField(field);
      expect(widget.required).toBe(true);
    });

    test(`should handle required field correctly`, () => {
      const field = {
        name: `required`,
        widget: `string`,
        required: true,
      };

      const widget = widgetFromSveltiaConfigField(field);
      expect(widget.required).toBe(true);
    });

    test(`should handle non-required field correctly`, () => {
      const field = {
        name: `optional`,
        widget: `string`,
        required: false,
      };

      const widget = widgetFromSveltiaConfigField(field);
      expect(widget.required).toBe(false);
    });
  });
});
