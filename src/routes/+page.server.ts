import { PrismaClient } from "@prisma/client";

export const load = async () => {
  const prisma = new PrismaClient();
  return {
    users: await prisma.users.findMany(),
  };
};
