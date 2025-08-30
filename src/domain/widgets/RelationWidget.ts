import { Widget } from '../Widget';

export class RelationWidget extends Widget {
  constructor(
    name: string,
    required: boolean,
    private readonly multiple: boolean,
    private readonly relatedCollectionName: string,
  ) {
    super(name, required);
  }

  public get zodSchemaAsString(): string {
    const refSchema = `reference("${this.relatedCollectionName}")`;
    const maybeMultipleSchema = this.multiple
      ? `z.array(${refSchema})`
      : refSchema;
    return `${maybeMultipleSchema}${this.required ? `` : `.nullable().optional()`}`;
  }
}
