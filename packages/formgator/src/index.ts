// #region Types

type Result<Data, Error> =
  | { success: true; data: Data }
  | { success: false; error: Error };

/**
 * An interface matching both `FormData` and `URLSearchParams` for read
 * operations.
 */
interface ReadonlyFormData {
  has(name: string): boolean;
  get(name: string): string | File | null;
  getAll(name: string): Array<string | File>;
}

type ValidationIssue =
  | { code: "type"; message: string }
  | { code: "invalid"; message: string }
  | { code: "required"; message: string }
  | { code: "minlength"; minlength: number; message: string }
  | { code: "maxlength"; maxlength: number; message: string }
  | { code: "pattern"; pattern: RegExp; message: string }
  | { code: "min"; min: number; message: string }
  | { code: "max"; max: number; message: string }
  | { code: "step"; step: number; message: string }
  | { code: "transform"; message: string }
  | { code: "refine"; message: string };

const errorGenerators = {
  type: () => ({ code: "type", message: "Invalid type" }),
  invalid: () => ({ code: "invalid", message: "Invalid value" }),
  required: () => ({ code: "required", message: "Required" }),
  minlength: (minlength: number) => ({
    code: "minlength",
    minlength,
    message: `Too short, minimum length is ${minlength}`,
  }),
  maxlength: (maxlength: number) => ({
    code: "maxlength",
    maxlength,
    message: `Too long, maximum length is ${maxlength}`,
  }),
  pattern: (pattern: RegExp) => ({
    code: "pattern",
    pattern,
    message: "Invalid format",
  }),
  min: (min: number) => ({
    code: "min",
    min,
    message: `Too small, minimum value is ${min}`,
  }),
  max: (max: number) => ({
    code: "max",
    max,
    message: `Too big, maximum value is ${max}`,
  }),
  step: (step: number) => ({
    code: "step",
    step,
    message: "Invalid step",
  }),
  refine: (message: string) => ({ code: "refine", message }),
  transform: (message: string) => ({ code: "transform", message }),
} satisfies {
  [K in ValidationIssue["code"]]: (...args: never) => ValidationIssue;
};

const succeed = <T>(data: T): Result<T, never> => ({
  success: true as const,
  data,
});
const fail = <T>(errors: T): Result<never, T> => ({
  success: false as const,
  error: errors,
});

export interface FormInput<T> {
  attributes: Record<string, unknown>;
  safeParse(data: ReadonlyFormData, name: string): Result<T, ValidationIssue>;

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
  refine(fn: (value: T) => unknown): FormInput<T>;

  /**
   * Makes the field optional, for inputs that may be removed or added
   * dynamically from the form.
   */
  nullable(): FormInput<T | null>;
}

export type Infer<T extends Record<string, FormInput<unknown>>> = {
  [K in keyof T]: T[K] extends FormInput<infer U> ? U : never;
};

export type InferError<T extends Record<string, FormInput<unknown>>> = {
  [K in keyof T]?: ValidationIssue;
};

interface FormGator<T extends Record<string, FormInput<unknown>>> {
  inputs: T;
  parse(data: ReadonlyFormData): Infer<T>;
  safeParse(
    data: ReadonlyFormData,
  ): Result<Infer<T>, { [K in keyof T]?: ValidationIssue }>;
}

// #region Methods

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

function nullable<T>(this: FormInput<T>): FormInput<T | null> {
  return {
    ...this,
    safeParse: (data, name) => {
      if (!data.has(name)) return succeed(null);
      return this.safeParse(data, name);
    },
  };
}

const methods = { transform, refine, nullable };

// #region Validators

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
      if (value !== null && value !== "on") return fail(errorGenerators.type());
      if (attributes.required && value === null)
        return fail(errorGenerators.required());
      return succeed(value === "on");
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
      if (typeof value !== "string") return fail(errorGenerators.type());
      if (!/^#[0-9a-f]{6}$/.test(value)) return fail(errorGenerators.invalid());
      return succeed(value as `#${string}`);
    },
  };
}

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
      if (typeof value !== "string") return fail(errorGenerators.type());
      if (value === "")
        return attributes.required
          ? fail(errorGenerators.required())
          : succeed(null);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        return fail(errorGenerators.invalid());
      const date = Date.parse(value);
      if (Number.isNaN(date)) return fail(errorGenerators.invalid());
      if (attributes.min && date < attributes.min.getTime())
        return fail(errorGenerators.min(attributes.min.getTime()));
      if (attributes.max && date > attributes.max.getTime())
        return fail(errorGenerators.max(attributes.max.getTime()));
      return succeed(value);
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
      if (typeof value !== "string") return fail(errorGenerators.type());
      if (value === "")
        return attributes.required
          ? fail(errorGenerators.required())
          : succeed(null);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
        return fail(errorGenerators.invalid());
      const date = Date.parse(value);
      if (Number.isNaN(date)) return fail(errorGenerators.invalid());
      if (attributes.min && date < attributes.min.getTime())
        return fail(errorGenerators.min(attributes.min.getTime()));
      if (attributes.max && date > attributes.max.getTime())
        return fail(errorGenerators.max(attributes.max.getTime()));
      return succeed(value);
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
      if (typeof value !== "string") return fail(errorGenerators.type());
      if (value === "")
        return attributes.required
          ? fail(errorGenerators.required())
          : succeed(attributes.multiple ? [] : null);

      if (attributes.multiple) {
        // Emails are comma-separated, with optional white space
        const values = value.split(",").map((value) => value.trim());
        for (const email of values)
          if (!emailRegex.test(email)) return fail(errorGenerators.invalid());

        return succeed(values);
      } else {
        if (!emailRegex.test(value)) return fail(errorGenerators.invalid());
        return succeed(value);
      }
    },
  };
}

/**
 * `<input type="number">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum value.
 * - `max` - Maximum value.
 */
export function number(attributes?: {
  required?: false;
  min?: number;
  max?: number;
}): FormInput<number | null>;
export function number(attributes: {
  required: true;
  min?: number;
  max?: number;
}): FormInput<number>;
export function number(
  attributes: {
    required?: boolean;
    min?: number;
    max?: number;
    /**
     * Accepted granularity of the value. Default is 1 (integer), set to 0 to
     * allow any number.
     *
     * The value must be a multiple of the step attribute, i.e. it could be
     * written as: `value = (min ?? 0) + k * step` with `k` an integer.
     *
     * @default 1 (only integers are accepted)
     */
    step?: number;
  } = {},
): FormInput<number | null> {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return fail(errorGenerators.type());
      if (value === "")
        return attributes.required
          ? fail(errorGenerators.required())
          : succeed(null);

      const number = Number(value);
      if (Number.isNaN(number)) return fail(errorGenerators.invalid());

      const step = attributes.step ?? 1;
      if (step > 0 && (number - (attributes.min ?? 0)) % step !== 0)
        return fail(errorGenerators.step(step));

      if (attributes.min !== undefined && number < attributes.min)
        return fail(errorGenerators.min(attributes.min));
      if (attributes.max !== undefined && number > attributes.max)
        return fail(errorGenerators.max(attributes.max));
      return succeed(number);
    },
  };
}

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

// type="search" and type="password" behave like type="text"
export { text as password, text as search };

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
      : typeof values === "function"
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
            return fail(errorGenerators.required());
          for (const value of values) {
            if (typeof value !== "string") return fail(errorGenerators.type());
            if (!accept(value)) return fail(errorGenerators.invalid());
          }
          return succeed(values as T[]);
        }
      : (data, name) => {
          const value = data.get(name);
          if (typeof value !== "string") return fail(errorGenerators.type());
          if (attributes.required && value === "")
            return fail(errorGenerators.required());
          if (!accept(value)) return fail(errorGenerators.invalid());
          return succeed(value as T);
        },
  };
}

// #region Form

class FormgatorError<
  T extends Record<string, FormInput<unknown>>,
> extends Error {
  constructor(public issues: InferError<T>) {
    super("Form validation failed");
  }
}

/** Creates a form validator from a record of form inputs. */
export function form<T extends Record<string, FormInput<unknown>>>(
  inputs: T,
): FormGator<T> {
  return {
    inputs,
    safeParse: (data) => {
      const entries: Array<[string, unknown]> = [];
      const errorEntries: Array<[string, ValidationIssue | null]> = [];
      for (const [name, input] of Object.entries(inputs)) {
        const result = input.safeParse(data, name);
        if (result.success === false) errorEntries.push([name, result.error]);
        else entries.push([name, result.data]);
      }
      return errorEntries.length === 0
        ? succeed(Object.fromEntries(entries) as Infer<T>)
        : fail(Object.fromEntries(errorEntries) as InferError<T>);
    },
    parse(data) {
      const result = this.safeParse(data);
      if (result.success === false) throw new FormgatorError(result.error);
      return result.data;
    },
  };
}
