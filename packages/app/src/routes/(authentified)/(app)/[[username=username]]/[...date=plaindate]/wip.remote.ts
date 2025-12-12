import { getRequestEvent, query } from "$app/server";
import { redirect } from "@sveltejs/kit";
import type { Prisma } from "db";
import z from "zod";

export const getEvent = query(
  z.object({ id: z.coerce.number(), authorId: z.number().optional() }),
  ({ id, authorId }) => {
    const { locals } = getRequestEvent();
    if (!locals.session?.user) redirect(307, "/welcome");

    const me = locals.session.user;
    const where: Prisma.TimelineEventWhereInput =
      authorId !== undefined
        ? { userId: me.id, authorId }
        : { userId: me.id, OR: [{ added: true }, { followed: true }] };

    return locals.prisma.timelineEvent.findUnique({
      where: { id, AND: where },
      include: { author: true, event: { include: { tags: true } } },
    });
  },
);

export const getLatest = query(z.number().optional(), (authorId) => {
  const { locals } = getRequestEvent();
  if (!locals.session?.user) redirect(307, "/welcome");

  const me = locals.session.user;
  const where: Prisma.TimelineEventWhereInput =
    authorId !== undefined
      ? { userId: me.id, authorId }
      : { userId: me.id, OR: [{ added: true }, { followed: true }] };

  return locals.prisma.timelineEvent.findMany({
    where,
    include: { author: true, event: { include: { tags: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
});

export const getFollowings = query(() => {
  const { locals } = getRequestEvent();
  if (!locals.session?.user) redirect(307, "/welcome");
  const me = locals.session.user;
  return locals.prisma.follow.findMany({
    where: { followerId: me.id },
    include: { following: true },
  });
});

export const getJournal = query(
  z.string().transform((value) => Temporal.PlainDate.from(value)),
  (date) => {
    const { locals } = getRequestEvent();
    if (!locals.session?.user) redirect(307, "/welcome");
    const me = locals.session.user;
    return locals.prisma.journalEntry.findUnique({
      where: {
        authorId_date: {
          authorId: me.id,
          date: date + "T00:00:00Z",
        },
      },
    });
  },
);

export const getTags = query(() => {
  const { locals } = getRequestEvent();
  if (!locals.session?.user) redirect(307, "/welcome");
  const me = locals.session.user;
  return locals.prisma.tag.findMany({ where: { ownerId: me.id } });
});

export const getJournalEntry = query(
  z.string().transform((value) => Temporal.PlainDate.from(value)),
  (date) => {
    const { locals } = getRequestEvent();
    if (!locals.session?.user) redirect(307, "/welcome");
    const me = locals.session.user;
    return locals.prisma.journalEntry.findUnique({
      where: {
        authorId_date: {
          authorId: me.id,
          date: date.toString() + "T00:00:00Z",
        },
      },
    });
  },
);

export const getHabits = query(
  z.string().transform((value) => Temporal.PlainDate.from(value)),
  (date) => {
    const { locals } = getRequestEvent();
    if (!locals.session?.user) redirect(307, "/welcome");
    const me = locals.session.user;
    return locals.prisma.habit.findMany({
      where: { userId: me.id },
      include: {
        marks: {
          where: { date: date.toString() + "T00:00:00Z" },
        },
      },
    });
  },
);
