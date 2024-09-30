import type { Result, ValidationIssue } from "./types.js";

export const errorGenerators = {
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
  min: (min: number | Date) => ({
    code: "min",
    min,
    message: `Too small, minimum value is ${min}`,
  }),
  max: (max: number | Date) => ({
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

export const succeed = <T>(data: T): Result<T, never> => ({
  success: true as const,
  data,
});
export const fail = <T>(errors: T): Result<never, T> => ({
  success: false as const,
  error: errors,
});
