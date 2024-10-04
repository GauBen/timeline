import { failures, type FormInput, methods, succeed } from "../definitions.js";

/**
 * `<input type="url">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 */
export function url(attributes?: {
  required?: false;
}): FormInput<string | null> & { asURL(): FormInput<URL | null> };
export function url(attributes: {
  required: true;
}): FormInput<string> & { asURL(): FormInput<URL> };
export function url(
  attributes: { required?: boolean } = {},
): FormInput<string | null> & { asURL(): FormInput<URL | null> } {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (value === "")
        return attributes.required ? failures.required() : succeed(null);
      if (!URL.canParse(value)) return failures.invalid();
      return succeed(value);
    },

    asURL() {
      return this.transform((url) => (url === null ? null : new URL(url)));
    },
  };
}
