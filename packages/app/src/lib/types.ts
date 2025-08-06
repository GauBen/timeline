import type * as Prisma from "db";

export type Event = Prisma.Prisma.TimelineEventGetPayload<{
  include: { author: true; event: { include: { tags: true } } };
}>;

export type MaybePromise<T> = T | Promise<T>;
