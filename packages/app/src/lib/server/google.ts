import { env } from "$env/dynamic/private";
import type { GoogleCalendarSync, GoogleUser, PrismaClient } from "db";
import { OAuth2Client } from "google-auth-library";
import { GaxiosError } from "googleapis-common";
import {
  type calendar_v3,
  calendar as googleCalendar,
} from "googleapis/build/src/apis/calendar/index.js";

export const client = new OAuth2Client(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
);

export const createUserClient = (prisma: PrismaClient, user: GoogleUser) => {
  const client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });
  client.on("tokens", async (tokens) => {
    await prisma.googleUser.update({
      where: { id: user.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      },
    });
  });
  return client;
};

export const getAllCalendarEvents = (
  auth: OAuth2Client,
  calendarId: string,
  syncToken: string | null,
  maxResults = 2500,
) => {
  const calendar = googleCalendar({ version: "v3", auth });

  // pageToken needs to be outside the generator to please TypeScript
  let pageToken: string | undefined = undefined;

  const generator = async function* (
    syncToken: string | null,
  ): AsyncGenerator<calendar_v3.Schema$Event[], string | null> {
    try {
      while (true) {
        const { data: events } = await calendar.events.list({
          calendarId,
          singleEvents: true,
          maxResults,
          pageToken,
          syncToken: syncToken ?? undefined,
        });
        yield events.items ?? [];

        // If there is no nextPageToken, we are done
        pageToken = events.nextPageToken ?? undefined;
        if (!pageToken) return events.nextSyncToken ?? null;
      }
    } catch (error) {
      // In case of 410 error, restart the sync from scratch
      if (error instanceof GaxiosError && error.status === 410) {
        console.log("Full sync required for calendar", calendarId);
        return yield* generator(null);
      }
      throw error;
    }
  };

  return generator(syncToken);
};

export const syncCalendar = async (
  prisma: PrismaClient,
  auth: OAuth2Client,
  syncSettings: GoogleCalendarSync,
) => {
  try {
    const generator = getAllCalendarEvents(
      auth,
      syncSettings.googleCalendarId,
      syncSettings.syncToken,
    );
    let result = await generator.next();
    let count = 0;
    while (!result.done) {
      count += result.value.length;
      const ids = await prisma.event.createManyAndReturn({
        select: { id: true },
        data: result.value.map((event) => ({
          authorId: syncSettings.userId,
          body: event.summary ?? "",
          start: event.start?.dateTime ?? `${event.start!.date}T00:00:00.000Z`,
          startTimezone: event.start?.timeZone ?? "Europe/Paris",
          end: event.end?.dateTime ?? `${event.end!.date}T00:00:00.000Z`,
          endTimezone: event.end?.timeZone ?? "Europe/Paris",
          createdAt: event.created!,
          public: true,
        })),
      });
      // TODO: explicit intermediate table
      await prisma.$executeRaw`
      INSERT INTO "_EventToTag" ("A", "B")
      SELECT id, ${syncSettings.tagId}
      FROM UNNEST(${ids.map(({ id }) => id)}) id
    `;
      result = await generator.next();
    }

    const row = await prisma.googleCalendarSync.update({
      where: { id: syncSettings.id },
      data: {
        syncToken: result.value,
        lastSyncedAt: new Date(),
        syncedEvents: count,
        pullCount: { increment: 1 },
      },
    });
    console.log(row);
  } catch (error) {
    console.error(
      "Failed to sync calendar",
      syncSettings.googleCalendarId,
      error,
    );
    await prisma.googleCalendarSync.update({
      where: { id: syncSettings.id },
      data: {
        syncError: {
          message: (error as Error).message,
        },
      },
    });
  }
};
