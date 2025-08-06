import { prisma } from "$lib/server/prisma.js";
import { error } from "@sveltejs/kit";
import type { Prisma } from "db";
import * as fg from "formgator";
import { formgate, loadgate } from "formgator/sveltekit";
//import * as journal from "../../_/journal/+page.server.js";

export const load = loadgate(
  {
    event: fg
      .text({ required: true, pattern: /^\d+$/ })
      .transform(Number)
      .optional(),
    //"/journal": fg.date({ required: true }).optional(),
  },
  async (searchParams, { parent }) => {
    const { me, user } = await parent();

    const where: Prisma.TimelineEventWhereInput = user
      ? { userId: me.id, authorId: user.id }
      : { userId: me.id, OR: [{ added: true }, { followed: true }] };

    const [event, latest, followings, journal, tags] = await Promise.all([
      searchParams.event
        ? prisma.timelineEvent.findUnique({
            where: { id: searchParams.event, AND: where },
            include: { author: true, event: { include: { tags: true } } },
          })
        : undefined,
      prisma.timelineEvent.findMany({
        where,
        include: { author: true, event: { include: { tags: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.follow.findMany({
        where: { followerId: me.id },
        include: { following: true },
      }),
      ,
      // searchParams["/journal"] &&
      //   prisma.journalEntry.findUnique({
      //     where: {
      //       authorId_date: {
      //         authorId: me.id,
      //         date: searchParams["/journal"] + "T00:00:00Z",
      //       },
      //     },
      //   }),
      prisma.tag.findMany({ where: { ownerId: me.id } }),
    ]);

    return { event, followings, journal, latest, tags };
  },
);

export const actions = {
  follow: async ({ locals, params }) => {
    if (!locals.session) error(401, "Unauthorized");
    const { username } = params;
    if (!username) error(400, "Invalid username");

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
    if (!locals.session) error(401, "Unauthorized");
    const { username } = params;
    if (!username) error(400, "Invalid username");

    await prisma.follow.deleteMany({
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
    if (!locals.session) error(401, "Unauthorized");
    const eventId = url.searchParams.get("/unAddEvent");
    if (!eventId) error(400, "Invalid event");
    await prisma.eventToUser.update({
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
    await prisma.event.delete({ where: { id, authorId: locals.session.id } });
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
        await prisma.habitMark.createMany({
          data: { habitId: data.habitId, date: data.date },
        });
      } else {
        await prisma.habitMark.deleteMany({
          where: { habitId: data.habitId, date: data.date },
        });
      }
    },
    { id: "markHabit" },
  ),

  //journal: journal.actions.default,
};
