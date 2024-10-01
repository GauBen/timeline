import { failures, type FormInput, methods, succeed } from "../definitions.js";

/**
 * `<input type="date">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum date.
 * - `max` - Maximum date.
 *
 * The output value is a string with the format `yyyy-mm-dd`.
 */
export function date(attributes?: {
  required?: false;
  min?: Date;
  max?: Date;
}): FormInput<string | null> & {
  asNumber: () => FormInput<number | null>;
  asDate: () => FormInput<Date | null>;
};
export function date(attributes: {
  required: true;
  min?: Date;
  max?: Date;
}): FormInput<string> & {
  asNumber: () => FormInput<number>;
  asDate: () => FormInput<Date>;
};
export function date(
  attributes: { required?: boolean; min?: Date; max?: Date } = {},
): FormInput<string | null> & {
  asNumber: () => FormInput<number | null>;
  asDate: () => FormInput<Date | null>;
} {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (value === "")
        return attributes.required ? failures.required() : succeed(null);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return failures.invalid();
      const date = Date.parse(value);
      if (Number.isNaN(date)) return failures.invalid();
      if (attributes.min && date < attributes.min.getTime())
        return failures.min(attributes.min);
      if (attributes.max && date > attributes.max.getTime())
        return failures.max(attributes.max);
      return succeed(value);
    },
    /**
     * Returns the date as a number representing the number of milliseconds
     * since January 1, 1970, 00:00:00 UTC.
     */
    asNumber() {
      return this.transform((value) =>
        value === null ? null : Date.parse(value),
      );
    },
    /** Returns the date as a Date object. */
    asDate() {
      return this.transform((value) =>
        value === null ? null : new Date(value),
      );
    },
  };
}
