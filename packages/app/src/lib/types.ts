import type * as Prisma from "@prisma/client";

export type Event = Prisma.TimelineEvent & { author: Prisma.User };
