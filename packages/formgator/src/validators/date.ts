import { methods } from "../methods.js";
import { FormInput } from "../types.js";
import { errorGenerators, fail, succeed } from "../utils.js";

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
      if (typeof value !== "string") return fail(errorGenerators.type());
      if (value === "")
        return attributes.required
          ? fail(errorGenerators.required())
          : succeed(null);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return fail(errorGenerators.invalid());
      const date = Date.parse(value);
      if (Number.isNaN(date)) return fail(errorGenerators.invalid());
      if (attributes.min && date < attributes.min.getTime())
        return fail(errorGenerators.min(attributes.min));
      if (attributes.max && date > attributes.max.getTime())
        return fail(errorGenerators.max(attributes.max));
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
