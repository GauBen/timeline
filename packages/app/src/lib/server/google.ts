import { env } from "$env/dynamic/private";
import type { GoogleUser } from "@prisma/client";
import { type calendar_v3, google, type Auth, Common } from "googleapis";
import { prisma } from "./prisma.js";

export const client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
);

export const createUserClient = (user: GoogleUser) => {
  const client = new google.auth.OAuth2(
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

export const syncCalendar = (
  auth: Auth.OAuth2Client,
  calendarId: string,
  syncToken: string | null,
  maxResults = 2500,
) => {
  const calendar = google.calendar({ version: "v3", auth });

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
      if (error instanceof Common.GaxiosError && error.status === 410) {
        console.log("Full sync required for calendar", calendarId);
        return yield* generator(null);
      }
      throw error;
    }
  };

  return generator(syncToken);
};
