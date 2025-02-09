import { createUserClient } from "$lib/server/google.js";
import { prisma } from "$lib/server/prisma.js";
import { SyncDirection } from "@prisma/client";
import { error } from "@sveltejs/kit";
import * as fg from "formgator";
import { formgate } from "formgator/sveltekit";
import { google } from "googleapis";
import { nanoid } from "nanoid";

export const load = async ({ parent, url, locals }) => {
  const { session } = await parent();

  if (!locals.session?.refreshToken)
    error(401, "Account not authenticated with Google");

  const auth = createUserClient(session);

  const calendar = google.calendar({ version: "v3", auth });

  const { data: calendars } = await calendar.calendarList.list();
  const sync = await prisma.googleCalendarSync.findMany({
    where: { userId: session.id },
    select: {
      googleCalendarId: true,
      direction: true,
      tag: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });
  const syncMap = new Map(
    sync.map(({ googleCalendarId, ...row }) => [googleCalendarId, row]),
  );

  const id = url.searchParams.get("id");

  if (id) {
    const { data: events } = await calendar.events.list({
      calendarId: id,
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
    });
    return {
      syncMap,
      calendars: calendars.items ?? [],
      events: events.items ?? [],
    };
  }

  return {
    syncMap,
    calendars: calendars.items ?? [],
  };
};

export const actions = {
  sync: formgate(
    {
      googleCalendarId: fg.hidden(),
      direction: fg.select(Object.values(SyncDirection), { required: true }),
      tagId: fg.number({ required: true }).transform((id) => BigInt(id)),
    },
    async ({ googleCalendarId, direction, tagId }, { locals, url }) => {
      if (!locals.session) error(401, "Unauthorized");
      const userId = locals.session.id;
      await prisma.googleCalendarSync.upsert({
        where: { userId_googleCalendarId: { userId, googleCalendarId } },
        create: { userId, googleCalendarId, direction, tagId },
        update: { direction, tagId },
      });
      const auth = createUserClient(locals.session);

      const calendar = google.calendar({ version: "v3", auth });
      const { data: response } = await calendar.events.watch({
        calendarId: googleCalendarId,
        requestBody: {
          id: nanoid(),
          type: "webhook",
          address: new URL("/api/webhook/google-events-watch", url).toString(),
        },
      });
      console.log(response);
    },
  ),

  unsync: formgate(
    { googleCalendarId: fg.hidden() },
    async ({ googleCalendarId }, { locals }) => {
      if (!locals.session) error(401, "Unauthorized");
      const userId = locals.session.id;
      await prisma.googleCalendarSync.deleteMany({
        where: { userId, googleCalendarId },
      });
    },
  ),
};
