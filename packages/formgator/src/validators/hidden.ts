import { methods } from "../methods.js";
import { FormInput } from "../types.js";
import { errorGenerators, fail, succeed } from "../utils.js";

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
      if (typeof value !== "string") return fail(errorGenerators.type());
      return succeed(value);
    },
  };
}
