export type Result<Data, Error> =
  | { success: true; data: Data }
  | { success: false; error: Error };

/**
 * An interface matching both `FormData` and `URLSearchParams` for read
 * operations.
 */
export interface ReadonlyFormData {
  has(name: string): boolean;
  get(name: string): string | File | null;
  getAll(name: string): Array<string | File>;
}

export type ValidationIssue =
  | { code: "type"; message: string }
  | { code: "invalid"; message: string }
  | { code: "required"; message: string }
  | { code: "minlength"; minlength: number; message: string }
  | { code: "maxlength"; maxlength: number; message: string }
  | { code: "pattern"; pattern: RegExp; message: string }
  | { code: "min"; min: number | Date; message: string }
  | { code: "max"; max: number | Date; message: string }
  | { code: "step"; step: number; message: string }
  | { code: "accept"; message: string }
  | { code: "transform"; message: string }
  | { code: "refine"; message: string };

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
  refine<U extends T>(
    fn: (value: T) => value is U,
    message?: string | ((value: T) => string),
  ): FormInput<U>;
  refine(
    fn: (value: T) => unknown,
    message?: string | ((value: T) => string),
  ): FormInput<T>;

  /**
   * Makes the field optional, for inputs that may be removed or added
   * dynamically to the form.
   *
   * It returns `undefined` instead of `null` to differentiate between a missing
   * field (`undefined`) and a field with an empty value (`null`).
   */
  optional(): FormInput<T | undefined>;
}

export type Infer<T extends Record<string, FormInput<unknown>>> = {
  [K in keyof T]: T[K] extends FormInput<infer U> ? U : never;
};

export type InferError<T extends Record<string, FormInput<unknown>>> = {
  [K in keyof T]?: ValidationIssue;
};

export interface FormGator<T extends Record<string, FormInput<unknown>>> {
  inputs: T;
  parse(data: ReadonlyFormData): Infer<T>;
  safeParse(
    data: ReadonlyFormData,
  ): Result<Infer<T>, { [K in keyof T]?: ValidationIssue }>;
}
