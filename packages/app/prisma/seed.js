// @ts-check
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

await prisma.$queryRaw`SELECT 1`;
