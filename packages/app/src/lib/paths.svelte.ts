import { resolveRoute as nativeResolveRoute } from "$app/paths";
import { page } from "$app/state";
import type { RouteParams } from "../routes/(authentified)/(app)/[[username=username]]/[...date=plaindate]/$types.js";

export default {
  get resolveRoute() {
    return (
      params: Partial<RouteParams>,
      {
        search = page.url.search,
        hash = page.url.hash,
      }: { search?: string; hash?: string } = {},
    ) => {
      if (!page.route.id)
        throw new Error("Cannot call resolveRoute outside of a page");
      return (
        nativeResolveRoute(page.route.id, { ...page.params, ...params }) +
        search +
        hash
      );
    };
  },
};
