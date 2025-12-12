import type { Prisma, User } from "db";
import { error, redirect } from "@sveltejs/kit";
import { form, getRequestEvent, query } from "$app/server";
import z from "zod";
import { timezones } from "$lib/server/tz.js";
import "temporal-polyfill/global";

export const getEvents = query(
  z.object({
    username: z.string().optional(),
    start: z.instanceof(Temporal.PlainDate),
    end: z.instanceof(Temporal.PlainDate),
  }),
  async ({ start, end, username }) => {
    const { locals } = getRequestEvent();

    if (!locals.session) error(401, "Unauthorized");
    const me = locals.session.user;
    if (!me) error(401, "Unauthorized");

    let user: User | undefined;
    if (username) {
      try {
        user = await locals.prisma.user.findUniqueOrThrow({
          where: { username },
        });
      } catch {
        error(404, "User not found");
      }
    }

    const where: Prisma.TimelineEventWhereInput = user
      ? { userId: me.id, authorId: user.id }
      : { userId: me.id, OR: [{ added: true }, { followed: true }] };

    // SQL query date boundaries
    const gte = start.toZonedDateTime(me.timezone).toInstant().toString();
    const lt = end.toZonedDateTime(me.timezone).toInstant().toString();

    const events = await locals.prisma.timelineEvent.findMany({
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

export const getEventsForDate = query.batch(
  z.object({
    username: z.string().optional(),
    date: z.string(),
  }),
  async (inputs) => {
    const { locals } = getRequestEvent();

    if (!locals.session) error(401, "Unauthorized");
    const me = locals.session.user;
    if (!me) error(401, "Unauthorized");

    // Assume all inputs have the same username
    const username = inputs[0].username;

    let user: User | undefined;
    if (username) {
      try {
        user = await locals.prisma.user.findUniqueOrThrow({
          where: { username },
        });
      } catch {
        error(404, "User not found");
      }
    }

    const where: Prisma.TimelineEventWhereInput = user
      ? { userId: me.id, authorId: user.id }
      : { userId: me.id, OR: [{ added: true }, { followed: true }] };

    const events = await locals.prisma.timelineEvent.findMany({
      where: {
        ...where,
        OR: inputs.map(({ date }) => {
          const gte = Temporal.PlainDate.from(date)
            .toZonedDateTime(me.timezone)
            .toInstant()
            .toString();
          const lt = Temporal.PlainDate.from(date)
            .toZonedDateTime(me.timezone)
            .add({ days: 1 })
            .toInstant()
            .toString();
          return {
            start: { gte, lt },
          };
        }),
      },
      include: { author: true, event: { include: { tags: true } } },
      orderBy: { start: "asc" },
      take: 100,
    });

    const map = Map.groupBy(events, (event) =>
      event.start
        .toTemporalInstant()
        .toZonedDateTimeISO(me.timezone)
        .toPlainDate()
        .toString(),
    );

    return ({ date }) => map.get(date) ?? [];
  },
);

export const createEvent = form(
  z.object({
    body: z.string().min(1).max(1024),
    start: z
      .stringFormat("datetime-local", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
      .transform((str) => Temporal.PlainDateTime.from(str)),
    startTimezone: z.string().refine((tz) => timezones.has(tz)),
    shared: z.enum(["public", "private", "shared"]),
    shared_with: z.array(z.string()).default([]),
    tags: z
      .array(
        z
          .string()
          .regex(/^\d+$/)
          .transform((id) => Number(id)),
      )
      .optional(),
  }),
  async (data) => {
    const { locals } = getRequestEvent();
    if (!locals.session) error(401);

    const tags = await locals.prisma.tag.findMany({
      where: { id: { in: data.tags }, ownerId: locals.session.id },
    });

    const start = data.start
      .toZonedDateTime(data.startTimezone)
      .toInstant()
      .toString();

    const { id } = await locals.prisma.event.create({
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
  },
);
