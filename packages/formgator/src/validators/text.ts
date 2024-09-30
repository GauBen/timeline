import { methods } from "../methods.js";
import { FormInput } from "../types.js";
import { errorGenerators, fail, succeed } from "../utils.js";

/**
 * `<input type="text">` form input validator.
 *
 * Does not accept new lines, use `textarea()` instead.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `maxlength` - Maximum length of the input.
 * - `minlength` - Minimum length of the input.
 * - `pattern` - Regular expression pattern to match.
 */
export function text(
  attributes: {
    required?: boolean;
    maxlength?: number;
    minlength?: number;
    /** A regular expression with the u flag for best compatibility. */
    pattern?: RegExp;
  } = {},
): FormInput<string> & { trim: () => FormInput<string> } {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return fail(errorGenerators.type());
      if (/[\r\n]/.test(value)) return fail(errorGenerators.invalid());
      if (attributes.required && value === "")
        return fail(errorGenerators.required());
      if (attributes.maxlength && value.length > attributes.maxlength)
        return fail(errorGenerators.maxlength(attributes.maxlength));
      if (attributes.minlength && value.length < attributes.minlength)
        return fail(errorGenerators.minlength(attributes.minlength));
      if (attributes.pattern && !attributes.pattern.test(value))
        return fail(errorGenerators.pattern(attributes.pattern));
      return succeed(value);
    },
    /** Removes the leading and trailing white space from the value. */
    trim() {
      return this.transform((value) => value.trim());
    },
  };
}
