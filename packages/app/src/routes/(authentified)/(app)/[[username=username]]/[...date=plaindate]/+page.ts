import { Temporal } from "@js-temporal/polyfill";
import * as fg from "formgator";
import { loadgate } from "formgator/sveltekit";

export const load = loadgate(
  {
    new: fg
      .text({ required: true })
      .transform(Temporal.PlainDateTime.from)
      .optional(),
  },
  (searchParams, { data }) => ({ ...data, eventInCreation: searchParams.new }),
);
