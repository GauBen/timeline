import type { FormInput } from "./types.js";
import { errorGenerators, fail, succeed } from "./utils.js";

/** Transforms the output value of a form input. */
function transform<T, U>(
  this: FormInput<T>,
  fn: (value: T) => U,
  catcher: (error: unknown) => string = () => "Transformation failed",
): FormInput<U> {
  return {
    ...this,
    ...methods,
    safeParse: (data, name) => {
      const result = this.safeParse(data, name);
      if (result.success === false) return result;
      try {
        return succeed(fn(result.data));
      } catch (error) {
        return fail(errorGenerators.transform(catcher(error)));
      }
    },
  };
}

/** Adds a custom validation to the input. */
function refine<T, U extends T>(
  this: FormInput<T>,
  fn: (value: T) => value is U,
  message: string | ((value: T) => string) = "Invalid value",
): FormInput<U> {
  return {
    ...this,
    ...methods,
    safeParse: (data, name) => {
      const result = this.safeParse(data, name);
      if (result.success === false) return result;

      if (!fn(result.data)) {
        return fail(
          errorGenerators.refine(
            typeof message === "string" ? message : message(result.data),
          ),
        );
      }

      return succeed(result.data);
    },
  };
}

function optional<T>(this: FormInput<T>): FormInput<T | undefined> {
  return {
    ...this,
    safeParse: (data, name) => {
      if (!data.has(name)) return succeed(undefined);
      return this.safeParse(data, name);
    },
  };
}

export const methods = { transform, refine, optional };
