import { prisma } from "$lib/server/prisma.js";
import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import type { Prisma } from "@prisma/client";
import { fail } from "@sveltejs/kit";
import Object_groupBy from "object.groupby";
import { z } from "zod";

export const load = async ({ parent, params }) => {
  const { me } = await parent();

  const start = params.date
    ? Temporal.PlainDate.from(params.date).toZonedDateTime("Europe/Paris")
    : Temporal.Now.zonedDateTimeISO("Europe/Paris").withPlainTime();
  const end = start.add({ days: 7 });

  const where: Prisma.EventWhereInput = {
    OR: [
      { authorId: me.id },
      {
        public: true,
        author: { followers: { some: { followerId: me.id } } },
      },
    ],
  };

  const [latest, events] = await Promise.all([
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
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const windows = {
    // Create empty columns for each day
    ...Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [
        start.add({ days: i }).toPlainDate().toString(),
        [] as never, // Remove these empty columns from the resulting type
      ]),
    ),

    ...Object_groupBy(events, (event) =>
      toTemporalInstant
        .call(event.date)
        .toZonedDateTimeISO("Europe/Paris")
        .toPlainDate()
        .toString(),
    ),
  };

  return { start: start.toString(), latest, windows };
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
};
