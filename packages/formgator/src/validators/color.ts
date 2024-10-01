import { failures, type FormInput, methods, succeed } from "../definitions.js";

/**
 * `<input type="color">` form input validator.
 *
 * It does not support any attributes.
 *
 * The output value is a string with the format `#rrggbb`.
 */
export function color(): FormInput<`#${string}`> {
  return {
    ...methods,
    attributes: {},
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (!/^#[0-9a-f]{6}$/.test(value)) return failures.invalid();
      return succeed(value as `#${string}`);
    },
  };
}
