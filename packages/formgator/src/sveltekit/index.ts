import type * as kit from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import * as fg from "../index.js";

/**
 * Adds request validation to a [form
 * action](https://kit.svelte.dev/docs/form-actions).
 *
 * @example
 *   ```ts
 *   export const actions = {
 *     login: formgate(
 *       {
 *         email: fg.email({ required: true }),
 *         password: fg.password({ required: true }),
 *       },
 *       ({ data }) => {
 *         // data.email and data.password are guaranteed to be strings
 *         // The form will be rejected as 400 Bad Request if they are missing or empty
 *       }
 *     )
 *   }
 *   ```;
 */
export function formgate<
  Action,
  Inputs extends Record<string, fg.FormInput<unknown>>,
>(
  inputs: Inputs,
  action: Action extends kit.Action<
    infer Params,
    infer OutputData,
    infer RouteId
  >
    ? (
        event: kit.RequestEvent<Params, RouteId> & { data: fg.Infer<Inputs> },
      ) => OutputData | Promise<OutputData>
    : never,
  options: {
    /** @default "POST" */
    method?: "GET" | "POST";
  } = {},
): Action {
  return (async (event: kit.RequestEvent & { data: fg.Infer<Inputs> }) => {
    const data = fg
      .form(inputs)
      .safeParse(
        options.method === "GET"
          ? event.url.searchParams
          : await event.request.formData(),
      );

    if (!data.success) return fail(400, { error: data.error });

    event.data = data.data;
    return action(event);
  }) as Action;
}
