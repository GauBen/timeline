import { error } from "@sveltejs/kit";
import * as fg from "formgator";
import { loadgate } from "formgator/sveltekit";
import { Temporal } from "temporal-polyfill";
import { getEvents } from "./events.remote.js";
import { browser } from "$app/environment";
import type { MaybePromise } from "$lib/types.js";

export const load = loadgate(
  {
    new: fg
      .text({ required: true })
      .transform(Temporal.PlainDateTime.from)
      .optional(),
  },
  async (searchParams, { data, params, parent }) => {
    const { me } = await parent();

    const matches = params.date.match(
      /^(?<year>\d{4})(?:-(?<month>\d\d)(?:-(?<day>\d\d))?)?$/,
    );

    const view: "Week" | "Month" | "Year" =
      !matches || matches.groups?.day
        ? "Week"
        : matches.groups?.month
          ? "Month"
          : "Year";

    if (params.date && !matches) error(400, "Invalid date");

    const start = matches
      ? Temporal.PlainDate.from({
          year: matches.groups?.year ? Number(matches.groups.year) : 1,
          month: matches.groups?.month ? Number(matches.groups.month) : 1,
          day: matches.groups?.day ? Number(matches.groups.day) : 1,
        })
      : Temporal.Now.plainDateISO(me.timezone);

    let events: MaybePromise<Awaited<ReturnType<typeof getEvents>>> =
      getEvents(params);

    if (!browser) events = await events;

    return { ...data, events, start, view, eventInCreation: searchParams.new };
  },
);
