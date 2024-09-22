import { prisma } from "$lib/server/prisma.js";
import { timezones } from "$lib/server/tz.js";
import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import type { Prisma, User } from "@prisma/client";
import { error, fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

// Polyfill until Vercel supports Node >= 21
function Object_groupBy<T, K extends PropertyKey>(
  iterable: Iterable<T>,
  callbackfn: (value: T, index: number) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  let index = 0;
  for (const value of iterable) {
    const key = callbackfn(value, index++);
    if (key in result) result[key].push(value);
    else result[key] = [value];
  }
  return result;
}

export const load = async ({ parent, params, url }) => {
  const { me } = await parent();

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

  const matches = params.date.match(
    /^(?<year>\d{4})(?:-(?<month>\d\d)(?:-(?<day>\d\d))?)?$/,
  );

  if (params.date && !matches) error(400, "Invalid date");

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
      }).toZonedDateTime(me.timezone)
    : Temporal.Now.zonedDateTimeISO(me.timezone).withPlainTime();

  const end = start.add(
    view === "day"
      ? { days: 7 }
      : view === "month"
        ? { months: 1 }
        : { years: 1 },
  );

  const where: Prisma.TimelineEventWhereInput = user
    ? { userId: me.id, authorId: user.id }
    : { userId: me.id, OR: [{ added: true }, { followed: true }] };

  const eventId = ((x) => (x ? BigInt(x) : undefined))(
    url.searchParams.get("event"),
  );
  const [event, latest, events, followed, followings, habits] =
    await Promise.all([
      eventId
        ? prisma.timelineEvent.findUnique({
            where: { id: eventId, AND: where },
            include: { author: true },
          })
        : undefined,
      prisma.timelineEvent.findMany({
        where,
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.timelineEvent.findMany({
        where: {
          ...where,
          date: {
            gte: new Date(start.epochMilliseconds),
            lt: new Date(end.epochMilliseconds),
          },
        },
        include: { author: true },
        orderBy: { date: "asc" },
        take: 100,
      }),
      user
        ? prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: me.id,
                followingId: user.id,
              },
            },
          })
        : undefined,
      prisma.follow.findMany({
        where: { followerId: me.id },
        include: { following: true },
      }),
      !user
        ? prisma.habit.findMany({
            where: { userId: me.id },
            include: {
              marks: {
                where: {
                  date: {
                    gte: new Date(start.epochMilliseconds),
                    lt: new Date(end.epochMilliseconds),
                  },
                },
              },
            },
          })
        : undefined,
    ]);

  const windows = Object_groupBy(events, (event) =>
    toTemporalInstant
      .call(event.date)
      .toZonedDateTimeISO(me.timezone)
      .toPlainDate()
      .toString(),
  );

  return {
    event,
    followed,
    followings,
    habits,
    latest,
    start: start.toString(),
    user,
    view,
    windows,
  };
};

export const actions = {
  createEvent: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: "Unauthorized" });

    const data = await request.formData();
    const input = {
      body: String(data.get("body")),
      date: String(data.get("date")),
      startTimezone: String(data.get("startTimezone")),
      public: Boolean(data.get("public")),
      users: data.getAll("shared_with"),
    };

    const result = z
      .object({
        body: z.string().min(1).max(1024),
        date: z.string().transform((date) => Temporal.PlainDateTime.from(date)),
        startTimezone: z.string().refine((tz) => timezones.has(tz)),
        public: z.boolean(),
        users: z.string().uuid().array(),
      })
      .safeParse(input);

    if (!result.success)
      return fail(400, { input, validationErrors: result.error.flatten() });

    const date = new Date(
      result.data.date.toZonedDateTime(
        result.data.startTimezone,
      ).epochMilliseconds,
    );

    await prisma.event.create({
      data: {
        body: result.data.body,
        date,
        startTimezone: result.data.startTimezone,
        public: result.data.public,
        authorId: locals.session.id,
        duration: 0,
        users: result.data.public
          ? {}
          : {
              createMany: {
                data: result.data.users.map((userId) => ({
                  userId,
                  shared: true,
                })),
              },
            },
      },
    });

    redirect(303, new URL(request.url).pathname);
  },

  follow: async ({ locals, params }) => {
    if (!locals.session) return error(401, "Unauthorized");
    const { username } = params;
    if (!username) return error(400, "Invalid username");

    try {
      await prisma.follow.create({
        data: {
          follower: { connect: { id: locals.session.id } },
          following: { connect: { username } },
        },
      });
    } catch {
      // Already following
    }
  },

  unfollow: async ({ locals, params }) => {
    if (!locals.session) return error(401, "Unauthorized");
    const { username } = params;
    if (!username) return error(400, "Invalid username");

    await prisma.follow.deleteMany({
      where: {
        followerId: locals.session.id,
        following: { username },
      },
    });
  },

  addEvent: async ({ locals, url }) => {
    if (!locals.session) return error(401, "Unauthorized");
    const eventId = url.searchParams.get("/addEvent");
    if (!eventId) return error(400, "Invalid event");
    const id = BigInt(eventId);
    await prisma.eventToUser.upsert({
      where: {
        eventId_userId: { eventId: id, userId: locals.session.id },
        OR: [{ shared: true }, { event: { public: true } }],
      },
      create: { eventId: id, userId: locals.session.id, added: true },
      update: { added: true },
    });
  },

  unAddEvent: async ({ locals, url }) => {
    if (!locals.session) return error(401, "Unauthorized");
    const eventId = url.searchParams.get("/unAddEvent");
    if (!eventId) return error(400, "Invalid event");
    await prisma.eventToUser.update({
      where: {
        eventId_userId: { eventId: BigInt(eventId), userId: locals.session.id },
        OR: [{ shared: true }, { event: { public: true } }],
      },
      data: { added: null },
    });
  },

  deleteEvent: async ({ locals, url }) => {
    if (!locals.session) return error(401, "Unauthorized");
    const eventId = url.searchParams.get("/deleteEvent");
    if (!eventId) return error(400, "Invalid event");
    const id = BigInt(eventId);
    await prisma.event.delete({ where: { id, authorId: locals.session.id } });
  },

  markHabit: async ({ locals, request }) => {
    if (!locals.session) return error(401, "Unauthorized");

    const data = await request.formData();
    const input = {
      habitId: data.get("habitId"),
      date: data.get("date"),
    };

    const result = z
      .object({
        habitId: z.string().pipe(z.coerce.bigint()),
        date: z.string().pipe(z.coerce.date()),
      })
      .safeParse(input);

    if (!result.success)
      return fail(400, { input, validationErrors: result.error.flatten() });

    if (data.get("mark") === "true")
      await prisma.habitMark.createMany({ data: result.data });
    else await prisma.habitMark.deleteMany({ where: result.data });
  },
};
