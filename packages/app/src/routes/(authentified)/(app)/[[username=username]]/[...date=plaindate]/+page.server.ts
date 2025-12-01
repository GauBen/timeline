import { error } from "@sveltejs/kit";
import type { Prisma } from "db";
import * as fg from "formgator";
import { formgate, loadgate } from "formgator/sveltekit";
import * as journal from "../../_/journal/+page.server.js";

export const load = loadgate(
  {
    "event": fg
      .text({ required: true, pattern: /^\d+$/ })
      .transform(Number)
      .optional(),
    "/journal": fg.date({ required: true }).optional(),
  },
  async (searchParams, { parent, locals }) => {
    const { me, user } = await parent();

    const where: Prisma.TimelineEventWhereInput = user
      ? { userId: me.id, authorId: user.id }
      : { userId: me.id, OR: [{ added: true }, { followed: true }] };

    const [event, latest, followings, journal, habits, tags] =
      await Promise.all([
        searchParams.event
          ? locals.prisma.timelineEvent.findUnique({
              where: { id: searchParams.event, AND: where },
              include: { author: true, event: { include: { tags: true } } },
            })
          : undefined,
        locals.prisma.timelineEvent.findMany({
          where,
          include: { author: true, event: { include: { tags: true } } },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        locals.prisma.follow.findMany({
          where: { followerId: me.id },
          include: { following: true },
        }),
        searchParams["/journal"] &&
          locals.prisma.journalEntry.findUnique({
            where: {
              authorId_date: {
                authorId: me.id,
                date: searchParams["/journal"] + "T00:00:00Z",
              },
            },
          }),
        searchParams["/journal"] &&
          locals.prisma.habit.findMany({
            where: { userId: me.id },
            include: {
              marks: {
                where: { date: searchParams["/journal"] + "T00:00:00Z" },
              },
            },
          }),
        locals.prisma.tag.findMany({ where: { ownerId: me.id } }),
      ]);

    return { event, followings, journal, latest, habits, tags };
  },
);

export const actions = {
  follow: async ({ locals, params }) => {
    if (!locals.session) error(401, "Unauthorized");
    const { username } = params;
    if (!username) error(400, "Invalid username");

    try {
      await locals.prisma.follow.create({
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
    if (!locals.session) error(401, "Unauthorized");
    const { username } = params;
    if (!username) error(400, "Invalid username");

    await locals.prisma.follow.deleteMany({
      where: {
        followerId: locals.session.id,
        following: { username },
      },
    });
  },

  addEvent: async ({ locals, url }) => {
    if (!locals.session) error(401, "Unauthorized");
    const eventId = url.searchParams.get("/addEvent");
    if (!eventId) error(400, "Invalid event");
    const id = Number(eventId);
    await locals.prisma.eventToUser.upsert({
      where: {
        eventId_userId: { eventId: id, userId: locals.session.id },
        OR: [{ shared: true }, { event: { public: true } }],
      },
      create: { eventId: id, userId: locals.session.id, added: true },
      update: { added: true },
    });
  },

  unAddEvent: async ({ locals, url }) => {
    if (!locals.session) error(401, "Unauthorized");
    const eventId = url.searchParams.get("/unAddEvent");
    if (!eventId) error(400, "Invalid event");
    await locals.prisma.eventToUser.update({
      where: {
        eventId_userId: { eventId: Number(eventId), userId: locals.session.id },
        OR: [{ shared: true }, { event: { public: true } }],
      },
      data: { added: null },
    });
  },

  deleteEvent: async ({ locals, url }) => {
    if (!locals.session) error(401, "Unauthorized");
    const eventId = url.searchParams.get("/deleteEvent");
    if (!eventId) error(400, "Invalid event");
    const id = Number(eventId);
    await locals.prisma.event.delete({
      where: { id, authorId: locals.session.id },
    });
  },

  markHabit: formgate(
    {
      mark: fg
        .select(["true", "false"], { required: true })
        .transform((value) => value === "true"),
      habitId: fg.text({ required: true }).transform(Number),
      date: fg.date({ required: true }).asDate(),
    },
    async (data, { locals }) => {
      if (!locals.session) error(401, "Unauthorized");

      if (data.mark) {
        await locals.prisma.habitMark.createMany({
          data: { habitId: data.habitId, date: data.date },
        });
      } else {
        await locals.prisma.habitMark.deleteMany({
          where: { habitId: data.habitId, date: data.date },
        });
      }
    },
    { id: "markHabit" },
  ),

  journal: journal.actions.default,
};
