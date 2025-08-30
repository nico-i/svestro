import { Widget } from '../Widget';

export class ImageWidget extends Widget {
  public get zodSchemaAsString(): string {
    return `z.string()${this.required ? `` : `.nullable().optional()`}`;
  }
}
