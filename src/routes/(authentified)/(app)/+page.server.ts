import { prisma } from "$lib/server/prisma.js";

export const load = async () => {
  return {
    users: await prisma.user.findMany(),
  };
};
