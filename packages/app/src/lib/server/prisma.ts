import type { PrismaClient } from "db";
import { getRequestEvent } from "$app/server";

export const prisma = new Proxy({} as PrismaClient, {
  get: (_, prop) => {
    const prisma = getRequestEvent().locals.prisma;
    return prisma[prop as keyof PrismaClient];
  },
});
