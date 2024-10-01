import { failures, type FormInput, methods, succeed } from "../definitions.js";

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
      if (typeof value !== "string") return failures.type();
      if (/[\r\n]/.test(value)) return failures.invalid();
      if (attributes.required && value === "") return failures.required();
      if (attributes.maxlength && value.length > attributes.maxlength)
        return failures.maxlength(attributes.maxlength);
      if (attributes.minlength && value.length < attributes.minlength)
        return failures.minlength(attributes.minlength);
      if (attributes.pattern && !attributes.pattern.test(value))
        return failures.pattern(attributes.pattern);
      return succeed(value);
    },
    /** Removes the leading and trailing white space from the value. */
    trim() {
      return this.transform((value) => value.trim());
    },
  };
}
