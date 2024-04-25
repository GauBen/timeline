import { prisma } from "$lib/server/prisma.js";
import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import type { Prisma, User } from "@prisma/client";
import { error, fail } from "@sveltejs/kit";
import Object_groupBy from "object.groupby";
import { z } from "zod";

export const load = async ({ parent, params }) => {
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
    /^(?<year>\d{4})(?:[/-](?<month>\d\d)(?:[/-](?<day>\d\d))?)?$/,
  );

  if (params.date && !matches) error(400, "Invalid date");

  const view: "day" | "month" | "year" =
    !matches || matches?.groups?.day
      ? "day"
      : matches?.groups?.month
        ? "month"
        : "year";

  const start = matches
    ? Temporal.PlainDate.from({
        year: matches.groups?.year ? Number(matches.groups.year) : 1,
        month: matches.groups?.month ? Number(matches.groups.month) : 1,
        day: matches.groups?.day ? Number(matches.groups.day) : 1,
      }).toZonedDateTime("Europe/Paris")
    : Temporal.Now.zonedDateTimeISO("Europe/Paris").withPlainTime();

  const end = start.add(
    view === "day"
      ? { days: 7 }
      : view === "month"
        ? { months: 1 }
        : { years: 1 },
  );

  const where: Prisma.EventWhereInput = user
    ? { authorId: user.id, OR: [{ authorId: me.id }, { public: true }] }
    : {
        OR: [
          { authorId: me.id },
          {
            public: true,
            author: { followers: { some: { followerId: me.id } } },
          },
        ],
      };

  const [latest, events, followed] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { author: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.event.findMany({
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
            followerId_followingId: { followerId: me.id, followingId: user.id },
          },
        })
      : undefined,
  ]);

  const windows = Object_groupBy(events, (event) =>
    toTemporalInstant
      .call(event.date)
      .toZonedDateTimeISO("Europe/Paris")
      .toPlainDate()
      .toString(),
  );

  return { user, followed, view, start: start.toString(), latest, windows };
};

export const actions = {
  createEvent: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: "Unauthorized" });

    const data = await request.formData();
    const input = {
      body: String(data.get("body")),
      date: String(data.get("date")),
      public: Boolean(data.get("public")),
    };

    const result = z
      .object({
        body: z.string().min(1).max(1024),
        date: z.string().pipe(z.coerce.date()),
        public: z.boolean(),
      })
      .safeParse(input);

    if (!result.success)
      return fail(400, { input, validationErrors: result.error.flatten() });

    return prisma.event.create({
      data: {
        ...result.data,
        authorId: locals.session.id,
        duration: 0,
      },
    });
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
};
