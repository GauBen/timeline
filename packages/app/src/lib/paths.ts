import { resolveRoute as nativeResolveRoute } from "$app/paths";
import { derived } from "svelte/store";
import { page } from "$app/stores";
import type { RouteParams } from "../routes/(authentified)/(app)/[[username=username]]/[...date=plaindate]/$types.js";

export const resolveRoute = derived(
  page,
  ($page) =>
    (params: Partial<RouteParams>, { search, hash } = $page.url) => {
      if (!$page.route.id)
        throw new Error("Cannot call resolveRoute outside of a page");
      return (
        nativeResolveRoute($page.route.id, {
          ...$page.params,
          ...params,
        }) +
        search +
        hash
      );
    },
);
