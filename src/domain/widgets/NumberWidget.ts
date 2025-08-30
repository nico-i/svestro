import { Widget } from '../Widget';

export class NumberWidget extends Widget {
  public get zodSchemaAsString(): string {
    return `z.number()${this.required ? `` : `.nullable().optional()`}`;
  }
}
