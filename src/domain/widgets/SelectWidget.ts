import { Widget } from '../Widget';

export class SelectWidget extends Widget {
  constructor(
    name: string,
    required: boolean,
    private readonly enumSchema: string,
  ) {
    super(name, required);
  }

  public get zodSchemaAsString(): string {
    return `${this.enumSchema}${this.required ? `` : `.nullable().optional()`}`;
  }
}
