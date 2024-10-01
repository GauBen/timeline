import { methods } from "../methods.js";
import { FormInput } from "../types.js";
import { errorGenerators, fail, succeed } from "../utils.js";

export function file(attributes?: {
  multiple?: false;
  required?: false;
  accept?: string[];
}): FormInput<File | null>;
export function file(attributes: {
  multiple: true;
  required?: boolean;
  accept?: string[];
}): FormInput<File[]>;
export function file(attributes: {
  multiple?: false;
  required: true;
  accept?: string[];
}): FormInput<File>;
export function file(
  attributes: {
    multiple?: boolean;
    required?: boolean;
    accept?: string[];
  } = {},
): FormInput<File | File[] | null> {
  const accept = (file: File) => {
    if (!attributes.accept) return true;
    return (attributes.accept as string[]).some((type) => {
      if (type.startsWith(".") && file.name.endsWith(type)) return true;
      if (type.endsWith("/*") && file.type.startsWith(type.slice(0, -1)))
        return true;
      if (file.type === type) return true;
    });
  };

  return {
    ...methods,
    attributes,
    safeParse: attributes.multiple
      ? (data, name) => {
          const values = data.getAll(name);
          if (values.length === 0)
            return attributes.required
              ? fail(errorGenerators.required())
              : succeed([]);
          for (const value of values) {
            if (!(value instanceof File)) return fail(errorGenerators.type());
            if (!accept(value))
              return fail(errorGenerators.accept(attributes.accept!));
          }
          return succeed(values as File[]);
        }
      : (data, name) => {
          const value = data.get(name);
          if (!(value instanceof File)) return fail(errorGenerators.type());
          if (!accept(value))
            return fail(errorGenerators.accept(attributes.accept!));
          return succeed(value);
        },
  };
}
