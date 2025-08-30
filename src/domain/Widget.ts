export abstract class Widget {
  constructor(
    /** The name of the widget in the admin UI */
    public readonly name: string,
    /** Whether the widget is required */
    public readonly required: boolean,
  ) {}

  public abstract get zodSchemaAsString(): string;
}
