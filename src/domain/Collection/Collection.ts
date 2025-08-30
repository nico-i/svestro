import { widgetFromSveltiaConfigField } from '@/domain/services/widget/WidgetService';
import { Widget } from '../Widget';

export class Collection {
  constructor(
    public readonly name: string,
    private readonly widgets: Widget[],
    private readonly folderPath: string,
    private readonly pathPrefix?: string,
  ) {}

  public static fromSveltiaConfigCollection(
    sveltiaCollection: object,
    pathPrefix?: string,
  ): Collection {
    if (!(`name` in sveltiaCollection)) {
      throw new Error(
        `Invalid collection configuration, missing 'name' property`,
      );
    }

    const { name } = sveltiaCollection;

    if (typeof name !== `string` || name.trim() === ``) {
      throw new Error(
        `Invalid collection configuration for collection ${name}, invalid 'name' property`,
      );
    }

    if (!(`folder` in sveltiaCollection)) {
      throw new Error(
        `Invalid collection configuration for collection ${name}, missing 'folder' property`,
      );
    }

    const { folder } = sveltiaCollection;

    if (typeof folder !== `string` || folder.trim() === ``) {
      throw new Error(
        `Invalid collection configuration for collection ${name}, invalid 'folder' property`,
      );
    }

    if (!(`fields` in sveltiaCollection)) {
      throw new Error(
        `Invalid collection configuration for collection ${name}, missing 'fields' property`,
      );
    }

    const { fields } = sveltiaCollection;

    if (!Array.isArray(fields)) {
      throw new Error(
        `Invalid collection configuration for collection ${name}, invalid 'fields' property`,
      );
    }

    const widgets = fields.map((field) => widgetFromSveltiaConfigField(field));

    return new Collection(name, widgets, folder, pathPrefix);
  }

  private get zodSchemaAsString(): string {
    return `
    z.object({
        ${this.widgets
          .map((widget) => `${widget.name}: ${widget.zodSchemaAsString}`)
          .join(`,\n`)}
    })`;
  }

  public getAstroCollectionDefinition(locale?: string): string {
    if (locale)
      return `
    defineCollection({
        loader: glob({
            pattern: "**/*.md",
            base: "${this.pathPrefix ? this.pathPrefix + `/` : ``}${this.folderPath}${
              locale ? `/${locale}` : ``
            }",
        }),
        schema: ${this.zodSchemaAsString},
    })`;

    return `
    defineCollection({
        loader: glob({
            pattern: "**/*.md",
            base: "${this.pathPrefix ? this.pathPrefix + `/` : ``}${this.folderPath}",
        }),
        schema: ${this.zodSchemaAsString},
    })`;
  }
}
