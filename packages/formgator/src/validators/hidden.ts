import { failures, type FormInput, methods, succeed } from "../definitions.js";

/**
 * `<input type="hidden">` form input validator.
 *
 * Not very useful, but included for completeness.
 */
export function hidden(): FormInput<string> {
  return {
    ...methods,
    attributes: {},
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      return succeed(value);
    },
  };
}