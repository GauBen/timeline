import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param) =>
  /^@[a-zA-Z0-9_]{3,20}$/.test(param);
