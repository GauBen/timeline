import type * as Prisma from "$prisma";

export type Event = Prisma.TimelineEvent & {
  author: Prisma.User;
  event: { tags: Prisma.Tag[] };
};

export type MaybePromise<T> = T | Promise<T>;
