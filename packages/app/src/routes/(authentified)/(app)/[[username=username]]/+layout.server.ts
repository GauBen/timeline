import { prisma } from "$lib/server/prisma.js";
import type { User } from "db";
import { error } from "@sveltejs/kit";

export const load = async ({ parent, params }) => {
  const { me } = await parent();

  let user: User | undefined;
  if (params.username) {
    try {
      user = await prisma.user.findUniqueOrThrow({
        where: { username: params.username },
      });
    } catch {
      error(404, "User not found");
    }
  }

  const followed = user
    ? await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: me.id,
            followingId: user.id,
          },
        },
      })
    : undefined;

  return { user, followed };
};
