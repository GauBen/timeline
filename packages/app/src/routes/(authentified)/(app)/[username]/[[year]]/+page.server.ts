import { prisma } from "$lib/server/prisma.js";
import { error } from "@sveltejs/kit";

export const load = async ({ params, parent }) => {
  const { me } = await parent();

  const year = params.year ? Number(params.year) : new Date().getFullYear();

  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { username: params.username },
      include: {
        events: {
          where: {
            OR: [{ authorId: me.id }, { public: true }],
          },
        },
      },
    });
    const [followed, mosaic] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: me.id, followingId: user.id },
        },
      }),
      prisma.$queryRaw<Array<{ date: Date; count: number }>>`
        SELECT date::DATE, COUNT(*)::INT FROM events
        WHERE author_id = ${user.id}::UUID AND (public OR author_id = ${me.id}::UUID)
        GROUP BY date::DATE
      `,
    ]);
    return { year, user, followed, mosaic };
  } catch (e) {
    console.error(e);
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
