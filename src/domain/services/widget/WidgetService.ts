import type { Widget } from '../../../domain/Widget';
import { BooleanWidget } from '../../../domain/widgets/BooleanWidget';
import { CodeWidget } from '../../../domain/widgets/CodeWidget';
import { ColorWidget } from '../../../domain/widgets/ColorWidget';
import { DateTimeWidget } from '../../../domain/widgets/DateTimeWidget';
import { FileWidget } from '../../../domain/widgets/FileWidget';
import { ImageWidget } from '../../../domain/widgets/ImageWidget';
import { ListWidget } from '../../../domain/widgets/ListWidget';
import { MarkdownWidget } from '../../../domain/widgets/MarkdownWidget';
import { NumberWidget } from '../../../domain/widgets/NumberWidget';
import { RelationWidget } from '../../../domain/widgets/RelationWidget';
import { SelectWidget } from '../../../domain/widgets/SelectWidget';
import { StringWidget } from '../../../domain/widgets/StringWidget';
import { UUIDWidget } from '../../../domain/widgets/UuidWidget';

const widgetTypes = [
  `boolean`,
  `code`,
  `color`,
  `datetime`,
  `file`,
  `image`,
  `hidden`,
  `key-value`,
  `list`,
  `markdown`,
  `number`,
  `object`,
  `relation`,
  `select`,
  `string`,
  `uuid`,
] as const;

export type WidgetType = (typeof widgetTypes)[number];

function isWidgetType(type: string): type is WidgetType {
  return widgetTypes.includes(type as WidgetType);
}

export function widgetFromSveltiaConfigField(
  sveltiaConfigField: object,
): Widget {
  if (!(`name` in sveltiaConfigField)) {
    throw new Error(
      `Missing 'name' field in field ${JSON.stringify(sveltiaConfigField)}`,
    );
  }
  if (typeof sveltiaConfigField.name !== `string`) {
    throw new Error(
      `Invalid 'name' field in field ${JSON.stringify(sveltiaConfigField)}`,
    );
  }
  const name: string = sveltiaConfigField.name;

  if (!(`widget` in sveltiaConfigField)) {
    throw new Error(`Missing 'widget' field in field ${name}`);
  }
  if (
    typeof sveltiaConfigField.widget !== `string` ||
    !isWidgetType(sveltiaConfigField.widget)
  ) {
    throw new Error(
      `Invalid 'widget' field in field ${name}. Received ${JSON.stringify(
        sveltiaConfigField.widget,
      )}`,
    );
  }
  const widgetType: WidgetType = sveltiaConfigField.widget;
  const required: boolean =
    !(`required` in sveltiaConfigField) || sveltiaConfigField.required === true;

  switch (widgetType) {
    case `boolean`:
      return new BooleanWidget(name, required);
    case `code`:
      return new CodeWidget(name, required);
    case `color`:
      return new ColorWidget(name, required);
    case `datetime`:
      return new DateTimeWidget(name, required);
    case `file`:
      return new FileWidget(name, required);
    case `image`:
      return new ImageWidget(name, required);
    case `list`: {
      const listItemFields: Widget[] = [];
      if (
        `field` in sveltiaConfigField &&
        typeof sveltiaConfigField.field === `object` &&
        sveltiaConfigField.field !== null
      ) {
        listItemFields.push(
          widgetFromSveltiaConfigField(sveltiaConfigField.field),
        );
      } else if (
        `fields` in sveltiaConfigField &&
        Array.isArray(sveltiaConfigField.fields)
      ) {
        listItemFields.push(
          ...sveltiaConfigField.fields.map((field: object) =>
            widgetFromSveltiaConfigField(field),
          ),
        );
      } else {
        throw new Error(`Missing or invalid 'fields' field in list ${name}`);
      }

      return new ListWidget(name, listItemFields);
    }
    case `markdown`:
      return new MarkdownWidget(name, required);
    case `number`:
      return new NumberWidget(name, required);
    case `relation`: {
      if (
        !(`collection` in sveltiaConfigField) ||
        typeof sveltiaConfigField.collection !== `string`
      ) {
        throw new Error(`Missing or invalid 'collection' field`);
      }
      const collection: string = sveltiaConfigField.collection;

      const isMultiple: boolean =
        `multiple` in sveltiaConfigField &&
        sveltiaConfigField.multiple === true;

      return new RelationWidget(
        name,
        isMultiple ? false : required,
        isMultiple,
        collection,
      );
    }
    case `select`: {
      if (
        !(`options` in sveltiaConfigField) ||
        !Array.isArray(sveltiaConfigField.options)
      ) {
        throw new Error(`Missing or invalid 'options' field`);
      }
      const options: string[] = sveltiaConfigField.options.map(
        (option: string | object) => {
          // Handle string array options
          if (typeof option === `string`) {
            return option;
          }

          // Handle object array options
          if (typeof option === `object` && option !== null) {
            if (!(`value` in option) || typeof option.value !== `string`) {
              throw new Error(`Invalid 'options' field`);
            }
            return option.value;
          }

          throw new Error(`Invalid 'options' field`);
        },
      );
      const optionsZodSchema = `z.enum(["${options.join(`", "`)}"])`;
      return new SelectWidget(name, required, optionsZodSchema);
    }
    case `string`:
      return new StringWidget(name, required);
    case `uuid`:
      return new UUIDWidget(name, required);
    default:
      throw new Error(`Unknown or unsupported widget type: ${widgetType}`);
  }
}
