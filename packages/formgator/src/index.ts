type Result<T> = { success: true; data: T } | { success: false; error: string };

interface FormInput<T> {
  attributes: Record<string, unknown>;
  safeParse(data: FormData, name: string): Result<T>;

  /**
   * Transforms the output of the validator into another value.
   *
   * @example
   *   text().transform((value) => value.length);
   *
   * @param fn - The transformation function.
   * @param catcher - In case the transformation function throws, this function
   *   is called to generate an error message.
   */
  transform<U>(
    fn: (value: T) => U,
    catcher?: (error: unknown) => string,
  ): FormInput<U>;

  /** Adds a custom validation to the input. */
  refine<U extends T>(fn: (value: T) => value is U): FormInput<U>;
}

type Output<T extends Record<string, FormInput<unknown>>> = {
  [K in keyof T]: T[K] extends FormInput<infer U> ? U : never;
};

interface FormGator<T extends Record<string, FormInput<unknown>>> {
  inputs: T;
  parse(data: FormData): Output<T>;
  safeParse(data: FormData): Result<Output<T>>;
}

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
        return { success: true, data: fn(result.data) };
      } catch (error) {
        return { success: false, error: catcher(error) };
      }
    },
  };
}

/** Adds a custom validation to the input. */
function refine<T, U extends T>(
  this: FormInput<T>,
  fn: (value: T) => value is U,
): FormInput<U> {
  return {
    ...this,
    ...methods,
    safeParse: (data, name) => {
      const result = this.safeParse(data, name);
      if (result.success === false) return result;
      if (!fn(result.data)) return { success: false, error: "Invalid value" };
      return { success: true, data: result.data };
    },
  };
}

const methods = { transform, refine };

/**
 * `<input type="checkbox">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 *
 * The `value` attribute is not supported, use `select({ multiple: true })`
 * instead if you want to handle several checkboxes with the same name but
 * different values.
 */
export function checkbox(
  attributes: { required?: boolean } = {},
): FormInput<boolean> {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (value !== null && value !== "on")
        return { success: false, error: "Invalid type" };
      if (attributes.required && value === null)
        return { success: false, error: "Required" };
      return { success: true, data: value === "on" };
    },
  };
}

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
      if (typeof value !== "string")
        return { success: false, error: "Invalid type" };
      if (!/^#[0-9a-f]{6}$/i.test(value))
        return { success: false, error: "Invalid format" };
      return { success: true, data: value as `#${string}` };
    },
  };
}

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
      if (typeof value !== "string")
        return { success: false, error: "Invalid type" };
      if (value === "")
        return attributes.required
          ? { success: false, error: "Required" }
          : { success: true, data: null };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return { success: false, error: "Invalid format" };
      const date = Date.parse(value);
      if (Number.isNaN(date)) return { success: false, error: "Invalid date" };
      if (attributes.required && value === "")
        return { success: false, error: "Required" };
      if (attributes.min && date < attributes.min.getTime())
        return { success: false, error: "Too early" };
      if (attributes.max && date > attributes.max.getTime())
        return { success: false, error: "Too late" };
      return { success: true, data: value };
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

export function datetimeLocal(attributes?: {
  required?: false;
  min?: Date;
  max?: Date;
}): FormInput<string | null> & {
  asNumber: () => FormInput<number | null>;
  asDate: () => FormInput<Date | null>;
};
export function datetimeLocal(attributes: {
  required: true;
  min?: Date;
  max?: Date;
}): FormInput<string> & {
  asNumber: () => FormInput<number>;
  asDate: () => FormInput<Date>;
};
/**
 * `<input type="datetime-local">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum date.
 * - `max` - Maximum date.
 *
 * The output value is a string with the format `yyyy-mm-ddThh:mm`.
 */
export function datetimeLocal(
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
      if (typeof value !== "string")
        return { success: false, error: "Invalid type" };
      if (value === "")
        return attributes.required
          ? { success: false, error: "Required" }
          : { success: true, data: null };
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
        return { success: false, error: "Invalid format" };
      const date = Date.parse(value);
      if (Number.isNaN(date)) return { success: false, error: "Invalid date" };
      if (attributes.required && value === "")
        return { success: false, error: "Required" };
      if (attributes.min && date < attributes.min.getTime())
        return { success: false, error: "Too early" };
      if (attributes.max && date > attributes.max.getTime())
        return { success: false, error: "Too late" };
      return { success: true, data: value };
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

/**
 * `<input type="text">` form input validator.
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
      if (typeof value !== "string")
        return { success: false, error: "Invalid type" };
      if (/[\r\n]/.test(value))
        return { success: false, error: "New lines not allowed" };
      if (attributes.required && value === "")
        return { success: false, error: "Required" };
      if (attributes.maxlength && value.length > attributes.maxlength)
        return { success: false, error: "Too long" };
      if (attributes.minlength && value.length < attributes.minlength)
        return { success: false, error: "Too short" };
      if (attributes.pattern && !attributes.pattern.test(value))
        return { success: false, error: "Invalid format" };
      return { success: true, data: value };
    },
    /** Removes the leading and trailing white space from the value. */
    trim() {
      return this.transform((value) => value.trim());
    },
  };
}

// type="search" behaves like type="text"
export { text as search };

export function select<T extends string>(
  values: Iterable<T> | ((value: string) => boolean),
  attributes?: { multiple?: false; required?: boolean },
): FormInput<T>;
export function select<T extends string>(
  values: Iterable<T> | ((value: string) => boolean),
  attributes: { multiple: true; required?: boolean },
): FormInput<T[]>;
/**
 * `<select>` form input validator.
 *
 * Supported attributes:
 *
 * - `multiple` - Whether the input allows multiple selections.
 * - `required` - Whether the input is required.
 *
 * @param values - The valid values for the input. It can be an iterable of
 *   strings or a function that returns a boolean if the value is valid.
 */
export function select<T extends string>(
  values: Iterable<T> | ((value: string) => boolean),
  attributes: { multiple?: boolean; required?: boolean } = {},
): FormInput<T | T[]> {
  const accept =
    values instanceof Set
      ? (value: string) => values.has(value)
      : values instanceof Function
        ? values
        : (() => {
            const set = new Set<string>(values);
            return (value: string) => set.has(value);
          })();

  return {
    ...methods,
    attributes,
    safeParse: attributes.multiple
      ? (data, name) => {
          const values = data.getAll(name);
          if (values.length === 0 && attributes.required)
            return { success: false, error: "Required" };
          for (const value of values) {
            if (typeof value !== "string")
              return { success: false, error: "Invalid type" };
            if (!accept(value))
              return { success: false, error: "Invalid value" };
          }
          return { success: true, data: values as T[] };
        }
      : (data, name) => {
          const value = data.get(name);
          if (typeof value !== "string")
            return { success: false, error: "Invalid type" };
          if (attributes.required && value === "")
            return { success: false, error: "Required" };
          if (!accept(value)) return { success: false, error: "Invalid value" };
          return { success: true, data: value as T };
        },
  };
}

export function form<T extends Record<string, FormInput<unknown>>>(
  inputs: T,
): FormGator<T> {
  return {
    inputs,
    safeParse: (data) => {
      const entries = [];
      for (const [name, input] of Object.entries(inputs)) {
        const result = input.safeParse(data, name);
        if (result.success === false) return result;
        entries.push([name, result.data]);
      }
      return {
        success: true,
        data: Object.fromEntries(entries),
      } as Result<Output<T>>;
    },
    parse(data) {
      const result = this.safeParse(data);
      if (result.success === false) throw new Error(result.error);
      return result.data;
    },
  };
}
