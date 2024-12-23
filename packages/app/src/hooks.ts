import { Temporal } from "@js-temporal/polyfill";
import type { Transport, Transporter } from "@sveltejs/kit";

export const transport: Transport = {
  PlainDate: {
    encode: (value) =>
      value instanceof Temporal.PlainDate && [value.toString()],
    decode: ([value]) => Temporal.PlainDate.from(value),
  } satisfies Transporter<Temporal.PlainDate, [string]>,
  PlainDateTime: {
    encode: (value) =>
      value instanceof Temporal.PlainDateTime && [value.toString()],
    decode: ([value]) => Temporal.PlainDateTime.from(value),
  } satisfies Transporter<Temporal.PlainDateTime, [string]>,
};
