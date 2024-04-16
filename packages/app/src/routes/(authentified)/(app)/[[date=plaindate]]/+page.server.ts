import { prisma } from "$lib/server/prisma.js";
import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
import Object_groupBy from "object.groupby";

export const load = async ({ parent, params }) => {
  const { me } = await parent();

  const start = params.date
    ? Temporal.PlainDate.from(params.date).toZonedDateTime("Europe/Paris")
    : Temporal.Now.zonedDateTimeISO("Europe/Paris").withPlainTime();
  const end = start.add({ days: 3 });

  const [latest, events] = await Promise.all([
    prisma.event.findMany({
      where: {
        OR: [
          { authorId: me.id },
          { author: { followers: { some: { followerId: me.id } } } },
        ],
      },
      include: { author: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.event.findMany({
      where: {
        OR: [
          { authorId: me.id },
          { author: { followers: { some: { followerId: me.id } } } },
        ],
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
      Array.from({ length: 3 }, (_, i) => [
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
