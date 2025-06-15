// @ts-check
import { PrismaClient } from "./generated/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

await prisma.$queryRaw`SELECT 1`;
