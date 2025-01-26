import { Temporal } from "@js-temporal/polyfill";
import * as fg from "formgator";
import { loadgate } from "formgator/sveltekit";
import type { Events } from "./+server.ts";
import { unflatten } from "devalue";
import { error } from "@sveltejs/kit";
import { browser } from "$app/environment";
import type { MaybePromise } from "$lib/types.js";

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

    const view =
      !matches || matches.groups?.day
        ? "day"
        : matches.groups?.month
          ? "month"
          : "year";

    if (params.date && !matches) error(400, "Invalid date");

    const start = matches
      ? Temporal.PlainDate.from({
          year: matches.groups?.year ? Number(matches.groups.year) : 1,
          month: matches.groups?.month ? Number(matches.groups.month) : 1,
          day: matches.groups?.day ? Number(matches.groups.day) : 1,
        })
      : Temporal.Now.plainDateISO(me.timezone);

    let events: MaybePromise<Events> = fetch("#" + params.date)
      .then((response) => response.json())
      .then((data) => unflatten(data));

    if (!browser) events = await events;

    return { ...data, events, start, view, eventInCreation: searchParams.new };
  },
);
