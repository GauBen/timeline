import { createUserClient, syncCalendar } from "$lib/server/google.js";
import { SyncDirection } from "db";
import { error } from "@sveltejs/kit";
import * as fg from "formgator";
import { formgate } from "formgator/sveltekit";
import { calendar as googleCalendar } from "googleapis/build/src/apis/calendar/index.js";

export const load = async ({ locals }) => {
  if (!locals.session) error(401, "Unauthorized");

  const googleUser = await locals.prisma.googleUser.findUniqueOrThrow({
    where: { id: locals.session.id },
  });
  if (!googleUser?.refreshToken)
    error(401, "Account not authenticated with Google");

  const auth = createUserClient(locals.prisma, googleUser);

  const calendar = googleCalendar({ version: "v3", auth });

  const [{ data: calendars }, sync, tags] = await Promise.all([
    calendar.calendarList.list(),
    locals.prisma.googleCalendarSync.findMany({
      where: { userId: googleUser.id },
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
    }),
    locals.prisma.tag.findMany({ where: { ownerId: googleUser.id } }),
  ]);

  const syncMap = new Map(
    sync.map(({ googleCalendarId, ...row }) => [googleCalendarId, row]),
  );

  return {
    syncMap,
    calendars: calendars.items ?? [],
    tags,
  };
};

export const actions = {
  sync: formgate(
    {
      googleCalendarId: fg.hidden(),
      direction: fg.select(Object.values(SyncDirection), { required: true }),
      tagId: fg.number({ required: true }).transform(Number),
    },
    async ({ googleCalendarId, direction, tagId }, { locals, url }) => {
      if (!locals.session) error(401, "Unauthorized");
      const googleUser = await locals.prisma.googleUser.findUniqueOrThrow({
        where: { id: locals.session.id },
      });
      if (!googleUser?.refreshToken)
        error(401, "Account not authenticated with Google");

      const userId = locals.session.id;
      const sync = await locals.prisma.googleCalendarSync.upsert({
        where: { userId_googleCalendarId: { userId, googleCalendarId } },
        create: { userId, googleCalendarId, direction, tagId },
        update: { direction, tagId },
      });
      const auth = createUserClient(locals.prisma, googleUser);

      const calendar = googleCalendar({ version: "v3", auth });

      if (url.protocol === "https:") {
        await calendar.events.watch({
          calendarId: googleCalendarId,
          requestBody: {
            id: sync.id.toString(),
            type: "webhook",
            address: new URL(
              "/api/webhook/google-events-watch",
              url,
            ).toString(),
          },
        });
      } else {
        console.log(
          "Skipping webhook registration because non-https URL will be rejected by Google",
        );
      }

      await syncCalendar(locals.prisma, auth, sync);
    },
  ),

  unsync: formgate(
    { googleCalendarId: fg.hidden() },
    async ({ googleCalendarId }, { locals }) => {
      if (!locals.session) error(401, "Unauthorized");
      const userId = locals.session.id;
      await locals.prisma.googleCalendarSync.deleteMany({
        where: { userId, googleCalendarId },
      });
    },
  ),
};
