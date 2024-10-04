import {
  fail,
  succeed,
  type FormInput,
  type ReadonlyFormData,
  type Result,
  type ValidationIssue,
} from "./definitions.js";

export type { FormInput };

export { checkbox } from "./validators/checkbox.js";
export { color } from "./validators/color.js";
export { date } from "./validators/date.js";
export { datetimeLocal } from "./validators/datetimeLocal.js";
export { email } from "./validators/email.js";
export { file } from "./validators/file.js";
export { hidden } from "./validators/hidden.js";
export { image } from "./validators/image.js";
export { month } from "./validators/month.js";
export { number } from "./validators/number.js";
export { radio } from "./validators/radio.js";
export { range } from "./validators/range.js";
export { select } from "./validators/select.js";
export {
  text as password,
  text as search,
  text as tel,
  text,
} from "./validators/text.js";
export { textarea } from "./validators/textarea.js";
export { time } from "./validators/time.js";
export { url } from "./validators/url.js";
export { week } from "./validators/week.js";

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

export class FormgatorError<
  T extends Record<string, FormInput<unknown>>,
> extends Error {
  constructor(public issues: InferError<T>) {
    super("Form validation failed");
    this.name = "FormgatorError";
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
