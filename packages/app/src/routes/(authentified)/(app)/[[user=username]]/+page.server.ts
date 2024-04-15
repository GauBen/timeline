import { prisma } from "$lib/server/prisma.js";
import { fail } from "@sveltejs/kit";
import { z } from "zod";

export const load = async ({ parent }) => {
  const { me, user } = await parent();

  return {
    user,
    events: await prisma.event.findMany({
      where: {
        author: user
          ? { id: user.id }
          : { followers: { some: { followerId: me.id } } },
      },
      include: {
        author: true,
      },
    }),
    followed:
      user &&
      (await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: me.id, followingId: user.id },
        },
      })),
  };
};

export const actions = {
  createEvent: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: "Unauthorized" });

    const data = await request.formData();
    const input = {
      body: String(data.get("body")),
      date: String(data.get("date")),
    };

    const result = z
      .object({
        body: z.string().min(1).max(1024),
        date: z.string().pipe(z.coerce.date()),
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
    if (!locals.session) return fail(401, { error: "Unauthorized" });
    if (!params.user) return fail(400, { error: "Missing user" });

    try {
      await prisma.follow.create({
        data: {
          follower: { connect: { id: locals.session.id } },
          following: { connect: { username: params.user.slice(1) } },
        },
      });
    } catch {
      // Already following
    }
  },

  unfollow: async ({ locals, params }) => {
    if (!locals.session) return fail(401, { error: "Unauthorized" });
    if (!params.user) return fail(400, { error: "Missing user" });

    await prisma.follow.deleteMany({
      where: {
        followerId: locals.session.id,
        following: { username: params.user.slice(1) },
      },
    });
  },
};
