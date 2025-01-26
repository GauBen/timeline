import { Temporal } from "@js-temporal/polyfill";
import * as fg from "formgator";
import { loadgate } from "formgator/sveltekit";
import type { _load } from "./+server.ts";
import { unflatten } from "devalue";
import { error } from "@sveltejs/kit";

export const load = loadgate(
  {
    new: fg
      .text({ required: true })
      .transform(Temporal.PlainDateTime.from)
      .optional(),
  },
  async (searchParams, { data, fetch, params, parent }) => {
    const { me } = await parent();

    const matches = params.date.match(
      /^(?<year>\d{4})(?:-(?<month>\d\d)(?:-(?<day>\d\d))?)?$/,
    );

    if (params.date && !matches) error(400, "Invalid date");

    const start = matches
      ? Temporal.PlainDate.from({
          year: matches.groups?.year ? Number(matches.groups.year) : 1,
          month: matches.groups?.month ? Number(matches.groups.month) : 1,
          day: matches.groups?.day ? Number(matches.groups.day) : 1,
        })
      : Temporal.Now.plainDateISO(me.timezone);

    const events = await fetch("#" + params.date)
      .then((response) => response.json())
      .then((data) => unflatten(data) as ReturnType<typeof _load>);

    console.log(events);
    return { ...data, ...events, start, eventInCreation: searchParams.new };
  },
);
