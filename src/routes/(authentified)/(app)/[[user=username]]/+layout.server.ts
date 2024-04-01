import { prisma } from "$lib/server/prisma.js";
import { error } from "@sveltejs/kit";

export const load = async ({ params }) => {
  const user =
    params.user &&
    (await prisma.user.findUnique({
      where: { username: params.user.slice(1) },
    }));

  if (params.user && !user) error(404, "User not found");

  return { user };
};
