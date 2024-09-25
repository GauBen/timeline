type Result<T> =
  | { success: true; value: T }
  | { success: false; error: string };

type FormInput<T> = {
  safeParse(data: FormData, name: string): Result<T>;
  attributes: Record<string, unknown>;
};

type Output<T extends Record<string, FormInput<unknown>>> = {
  [K in keyof T]: T[K] extends FormInput<infer U> ? U : never;
};

type FormGator<T> = {
  parse(data: FormData): T;
  safeParse(data: FormData): Result<T>;
};

export function text(attributes: { required?: true } = {}): FormInput<string> {
  return {
    attributes,
    safeParse(data, name) {
      const value = data.get(name);
      if (typeof value !== "string")
        return { success: false, error: "Invalid type" };
      if (attributes.required && value === "")
        return { success: false, error: "Required" };
      return { success: true, value };
    },
  };
}

export function form<T extends Record<string, FormInput<unknown>>>(
  schema: T,
): FormGator<Output<T>> {
  return {
    safeParse(data) {
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
