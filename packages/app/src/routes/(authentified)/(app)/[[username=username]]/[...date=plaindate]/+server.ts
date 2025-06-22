import { prisma } from "$lib/server/prisma.js";
import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import type { Prisma, User } from "db";
import { error } from "@sveltejs/kit";
import { stringify } from "devalue";

export type Events = Awaited<ReturnType<typeof load>>;

const load = async (me: User, user: User | undefined, date: string) => {
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
  const gte = start.toZonedDateTime(me.timezone).toInstant().toString();
  const lt = start
    .add(
      view === "day"
        ? { days: 7 }
        : { [view === "month" ? "months" : "years"]: 1 },
    )
    .toZonedDateTime(me.timezone)
    .toInstant()
    .toString();

  const [events, habits] = await Promise.all([
    prisma.timelineEvent.findMany({
      where: {
        ...where,
        start: { gte, lt },
      },
      include: { author: true, event: { include: { tags: true } } },
      orderBy: { start: "asc" },
      take: 100,
    }),
    prisma.habit.findMany({
      where: { userId: me.id },
      include: {
        marks: { where: { date: { gte, lt } } },
      },
    }),
  ]);

  const windows = Map.groupBy(events, (event) =>
    toTemporalInstant
      .call(event.start)
      .toZonedDateTimeISO(me.timezone)
      .toPlainDate()
      .toString(),
  );

  return {
    habits,
    windows: Object.fromEntries(
      Array.from({ length: 7 }, (_, days) => {
        const key = start.add({ days }).toString();
        return [key, windows.get(key) ?? []];
      }),
    ),
  };
};

export const GET = async ({ params, locals }) => {
  if (!locals.session) error(401, "Unauthorized");
  const me = await prisma.user.findUnique({ where: { id: locals.session.id } });
  if (!me) error(401, "Unauthorized");

  let user: User | undefined;
  if (params.username) {
    try {
      user = await prisma.user.findUniqueOrThrow({
        where: { username: params.username },
      });
    } catch {
      error(404, "User not found");
    }
  }

  return new Response(stringify(await load(me, user, params.date)), {
    headers: { "content-type": "application/json" },
  });
};
