import { prisma } from "$lib/server/prisma.js";
import type { Prisma, User } from "db";
import { error } from "@sveltejs/kit";
import { getRequestEvent, query } from "$app/server";
import z from "zod";

export const getEvents = query(
  z.object({
    username: z.string().optional(),
    date: z.string(),
  }),
  async ({ date, username }) => {
    const { locals } = getRequestEvent();

    if (!locals.session) error(401, "Unauthorized");
    const me = locals.session.user;
    if (!me) error(401, "Unauthorized");

    let user: User | undefined;
    if (username) {
      try {
        user = await prisma.user.findUniqueOrThrow({
          where: { username },
        });
      } catch {
        error(404, "User not found");
      }
    }

    const where: Prisma.TimelineEventWhereInput = user
      ? { userId: me.id, authorId: user.id }
      : { userId: me.id, OR: [{ added: true }, { followed: true }] };

    const matches = date.match(
      /^(?<year>\d{4})(?:-(?<month>\d\d)(?:-(?<day>\d\d))?)?$/,
    );

    if (date && !matches) error(400, "Invalid date");

    const view =
      !matches || matches.groups?.day
        ? "day"
        : matches.groups?.month
          ? "month"
          : "year";

    const start = matches
      ? Temporal.PlainDate.from({
          year: matches.groups?.year ? Number(matches.groups.year) : 1,
          month: matches.groups?.month ? Number(matches.groups.month) : 1,
          day: matches.groups?.day ? Number(matches.groups.day) : 1,
        })
      : Temporal.Now.plainDateISO(me.timezone);

    // SQL query date boundaries
    const gte = start
      .subtract({ days: view === "day" ? 7 : 0 })
      .toZonedDateTime(me.timezone)
      .toInstant()
      .toString();
    const lt = start
      .add(
        view === "day"
          ? { days: 7 }
          : { [view === "month" ? "months" : "years"]: 1 },
      )
      .toZonedDateTime(me.timezone)
      .toInstant()
      .toString();

    const events = await prisma.timelineEvent.findMany({
      where: {
        ...where,
        start: { gte, lt },
      },
      include: { author: true, event: { include: { tags: true } } },
      orderBy: { start: "asc" },
      take: 100,
    });

    return Map.groupBy(events, (event) =>
      event.start
        .toTemporalInstant()
        .toZonedDateTimeISO(me.timezone)
        .toPlainDate()
        .toString(),
    );
  },
);
