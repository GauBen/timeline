import type * as Prisma from "@prisma/client";

export type Event = Prisma.Event & { author: Prisma.User };

export type CalendarEvent = Event & { added: boolean };
