import { failures, type FormInput, methods, succeed } from "../definitions.js";

/**
 * `<input type="month">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum date.
 * - `max` - Maximum date.
 *
 * The output value is a string with the format `yyyy-mm-dd`.
 */
export function month(attributes?: {
  required?: false;
  min?: string;
  max?: string;
}): FormInput<string | null> & {
  asNumber: () => FormInput<number | null>;
  asDate: () => FormInput<Date | null>;
};
export function month(attributes: {
  required: true;
  min?: string;
  max?: string;
}): FormInput<string> & {
  asNumber: () => FormInput<number>;
  asDate: () => FormInput<Date>;
};
export function month(
  attributes: { required?: boolean; min?: string; max?: string } = {},
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
      if (!/^\d{4}-\d{2}$/.test(value)) return failures.invalid();
      if (Number.isNaN(Date.parse(value))) return failures.invalid();
      if (attributes.min && value < attributes.min)
        return failures.min(attributes.min);
      if (attributes.max && value > attributes.max)
        return failures.max(attributes.max);
      return succeed(value);
    },
    /**
     * Returns the month as a number representing the number of milliseconds
     * since January 1, 1970, 00:00:00 UTC.
     */
    asNumber() {
      return this.transform((value) =>
        value === null ? null : Date.parse(value),
      );
    },
    /** Returns the month as a Date object. */
    asDate() {
      return this.transform((value) =>
        value === null ? null : new Date(value),
      );
    },
  };
}