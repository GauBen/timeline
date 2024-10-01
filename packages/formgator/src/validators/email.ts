import { failures, type FormInput, methods, succeed } from "../definitions.js";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * `<input type="email">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `multiple` - Whether the input allows multiple comma-separated email
 *   addresses.
 */
export function email(attributes?: {
  required?: false;
  multiple?: false;
}): FormInput<string | null>;
export function email(attributes: {
  required: true;
  multiple?: false;
}): FormInput<string>;
export function email(attributes: {
  required?: boolean;
  multiple: true;
}): FormInput<string[]>;
export function email(
  attributes: { required?: boolean; multiple?: boolean } = {},
): FormInput<string | string[] | null> {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (value === "")
        return attributes.required
          ? failures.required()
          : succeed(attributes.multiple ? [] : null);

      if (attributes.multiple) {
        // Emails are comma-separated, with optional white space
        const values = value.split(",").map((value) => value.trim());
        for (const email of values)
          if (!emailRegex.test(email)) return failures.invalid();

        return succeed(values);
      } else {
        if (!emailRegex.test(value)) return failures.invalid();
        return succeed(value);
      }
    },
  };
}
