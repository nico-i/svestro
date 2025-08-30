import { Widget } from '../Widget';

export class ColorWidget extends Widget {
  public get zodSchemaAsString(): string {
    return `z.string()${this.required ? `` : `.nullable().optional()`}`;
  }
}
