import { Widget } from '../Widget';

export class DateTimeWidget extends Widget {
  public get zodSchemaAsString(): string {
    if (this.required) {
      return `z.coerce.date()`;
    }
    // can either be '' or a date when not required
    return `z.union([z.string().transform((val) => (val === "" ? undefined : new Date(val))), z.date()]).optional()`;
  }
}
