import { Widget } from '../Widget';

export class StringWidget extends Widget {
  public get zodSchemaAsString(): string {
    return `z.string()${this.required ? `` : `.nullable().optional()`}`;
  }
}
