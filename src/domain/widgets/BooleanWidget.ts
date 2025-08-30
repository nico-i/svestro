import { Widget } from '../Widget';

export class BooleanWidget extends Widget {
  public get zodSchemaAsString(): string {
    return `z.boolean()${this.required ? `` : `.nullable().optional()`}`;
  }
}
