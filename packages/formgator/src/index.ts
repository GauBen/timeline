import {
  FormGator,
  FormInput,
  Infer,
  InferError,
  ValidationIssue,
} from "./types.js";
import { fail, succeed } from "./utils.js";

export type { FormInput, Infer, InferError } from "./types.js";

export { checkbox } from "./validators/checkbox.js";
export { color } from "./validators/color.js";
export { date } from "./validators/date.js";
export { datetimeLocal } from "./validators/datetimeLocal.js";
export { email } from "./validators/email.js";
export { file } from "./validators/file.js";
export { number } from "./validators/number.js";
export { select } from "./validators/select.js";
export { text as password, text as search, text } from "./validators/text.js";

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
