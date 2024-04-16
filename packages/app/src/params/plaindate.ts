import { Temporal } from "@js-temporal/polyfill";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param) => {
  if (!/^\d{4}-\d\d-\d\d$/.test(param)) return false;

  try {
    Temporal.PlainDate.from(param);
    return true;
  } catch {
    return false;
  }
};
