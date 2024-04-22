import { prisma } from "$lib/server/prisma.js";
import { error } from "@sveltejs/kit";

export const load = async ({ params, parent }) => {
  const { me } = await parent();
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: params,
      include: {
        events: {
          where: {
            OR: [{ authorId: me.id }, { public: true }],
          },
        },
      },
    });
    return {
      user,
      followed: await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: me.id, followingId: user.id },
        },
      }),
    };
  } catch {
    error(404, "User not found");
  }
};

export const actions = {
  follow: async ({ locals, params }) => {
    if (!locals.session) return error(401, "Unauthorized");

    try {
      await prisma.follow.create({
        data: {
          follower: { connect: { id: locals.session.id } },
          following: { connect: params },
        },
      });
    } catch {
      // Already following
    }
  },

  unfollow: async ({ locals, params }) => {
    if (!locals.session) return error(401, "Unauthorized");

    await prisma.follow.deleteMany({
      where: {
        followerId: locals.session.id,
        following: params,
      },
    });
  },
};
