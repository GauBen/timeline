type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

type FormInput<T> = {
  safeParse(data: FormData, name: string): Result<T>;
  attributes: Record<string, unknown>;
  pipe: <U>(fn: (input: T) => U) => FormInput<U>;
};

type Output<T extends Record<string, FormInput<unknown>>> = {
  [K in keyof T]: T[K] extends FormInput<infer U> ? U : never;
};

type FormGator<T> = {
  parse(data: FormData): T;
  safeParse(data: FormData): Result<T>;
};

/** Transforms the output value of a form input. */
function pipe<T, U>(this: FormInput<T>, fn: (input: T) => U): FormInput<U> {
  return {
    ...this,
    pipe, // Redeclare the pipe method to keep the generics happy
    safeParse: (data, name) => {
      const result = this.safeParse(data, name);
      if (result.success === false) return result;
      return { success: true, value: fn(result.value) };
    },
  };
}

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
    attributes,
    pipe,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (value !== null && value !== "on")
        return { success: false, error: "Invalid type" };
      if (attributes.required && value === null)
        return { success: false, error: "Required" };
      return { success: true, value: value === "on" };
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
    attributes: {},
    pipe,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string")
        return { success: false, error: "Invalid type" };
      if (!/^#[0-9a-f]{6}$/i.test(value))
        return { success: false, error: "Invalid format" };
      return { success: true, value: value as `#${string}` };
    },
  };
}

export function date(attributes: {
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
    attributes,
    pipe,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string")
        return { success: false, error: "Invalid type" };
      if (value === "")
        return attributes.required
          ? { success: false, error: "Required" }
          : { success: true, value: null };
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
      return { success: true, value };
    },
    /**
     * Returns the date as a number representing the number of milliseconds
     * since January 1, 1970, 00:00:00 UTC.
     */
    asNumber() {
      return this.pipe((value) => (value === null ? null : Date.parse(value)));
    },
    /** Returns the date as a Date object. */
    asDate() {
      return this.pipe((value) => (value === null ? null : new Date(value)));
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
    attributes,
    pipe,
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
      return { success: true, value };
    },
    /** Removes the leading and trailing white space from the value. */
    trim() {
      return this.pipe((value) => value.trim());
    },
  };
}

// type="search" behaves like type="text"
export { text as search };

export function form<T extends Record<string, FormInput<unknown>>>(
  schema: T,
): FormGator<Output<T>> {
  return {
    safeParse: (data) => {
      const entries = [];
      for (const [name, input] of Object.entries(schema)) {
        const result = input.safeParse(data, name);
        if (result.success === false) return result;
        entries.push([name, result.value]);
      }
      return {
        success: true,
        value: Object.fromEntries(entries),
      } as Result<Output<T>>;
    },
    parse(data) {
      const result = this.safeParse(data);
      if (result.success === false) throw new Error(result.error);
      return result.value;
    },
  };
}
