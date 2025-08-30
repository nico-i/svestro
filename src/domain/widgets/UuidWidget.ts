import { Widget } from '../Widget';

export class UUIDWidget extends Widget {
  public get zodSchemaAsString(): string {
    return `z.string().uuid()${this.required ? `` : `.nullable().optional()`}`;
  }
}
