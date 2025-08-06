import { prisma } from "$lib/server/prisma.js";
import type { Prisma, User } from "db";
import { error, redirect } from "@sveltejs/kit";
import { form, getRequestEvent, query } from "$app/server";
import z from "zod";
import * as fg from "formgator";
import { timezones } from "$lib/server/tz.js";

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

export const createEvent = form(async (input) => {
  const { locals } = getRequestEvent();
  if (!locals.session) error(401);

  const result = fg
    .form({
      body: fg.text({ required: true, minlength: 1, maxlength: 1024 }),
      start: fg
        .datetimeLocal({ required: true })
        .transform(Temporal.PlainDateTime.from),
      startTimezone: fg.select(timezones, { required: true }),
      shared: fg.select(["public", "private", "shared"] as const, {
        required: true,
      }),
      shared_with: fg.select(() => true, { multiple: true }),
      tags: fg.multi().map((id) => Number(id)),
    })
    .safeParse(input);

  if (!result.success) error(400);

  const { data } = result;

  const tags = await prisma.tag.findMany({
    where: { id: { in: data.tags }, ownerId: locals.session.id },
  });

  const start = data.start
    .toZonedDateTime(data.startTimezone)
    .toInstant()
    .toString();

  const { id } = await prisma.event.create({
    data: {
      body: data.body,
      start,
      startTimezone: data.startTimezone,
      end: start,
      public: data.shared === "public",
      authorId: locals.session.id,
      users:
        data.shared === "shared"
          ? {
              createMany: {
                data: data.shared_with.map((userId) => ({
                  userId: Number(userId),
                  shared: true,
                })),
              },
            }
          : {},
      tags: {
        connect: tags.map((tag) => ({ id: tag.id })),
      },
    },
  });

  redirect(303, "?" + new URLSearchParams({ event: String(id) }));
});
