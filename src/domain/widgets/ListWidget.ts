import { Widget } from '../Widget';

export class ListWidget extends Widget {
  constructor(
    name: string,
    private readonly listItemWidgets: Widget[],
  ) {
    super(name, false);
  }

  public get zodSchemaAsString(): string {
    const listItemSchema =
      this.listItemWidgets.length === 1
        ? this.listItemWidgets[0]?.zodSchemaAsString
        : `z.object({${this.listItemWidgets
            .map((widget) => `${widget.name}: ${widget.zodSchemaAsString}`)
            .join(`, `)}})`;

    return `z.array(${listItemSchema})${this.required ? `` : `.nullable().optional()`}`;
  }
}
