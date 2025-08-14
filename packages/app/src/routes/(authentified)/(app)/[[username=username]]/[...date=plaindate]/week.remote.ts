import { getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import type { Prisma } from "db";
import z from "zod";

export const load = query(
  z.object({
    from: z.string().transform((v) => Temporal.PlainDate.from(v)),
    to: z.string().transform((v) => Temporal.PlainDate.from(v)),
  }),
  ({ from, to }) => {
    const event = getRequestEvent();
    const { locals } = event;
    if (!locals.session?.user) error(401);
    const me = locals.session.user;

    const where: Prisma.TimelineEventWhereInput = {
      userId: me.id,
      OR: [{ added: true }, { followed: true }],
    };

    return locals.prisma.timelineEvent.findMany({
      where: {
        ...where,
        start: {
          gte: from.toZonedDateTime(me.timezone).toInstant().toString(),
          lt: to.toZonedDateTime(me.timezone).toInstant().toString(),
        },
      },
      include: { author: true, event: { include: { tags: true } } },
      orderBy: { start: "asc" },
      take: 100,
    });
  },
);
