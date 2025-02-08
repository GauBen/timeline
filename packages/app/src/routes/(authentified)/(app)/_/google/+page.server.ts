import { prisma } from "$lib/server/prisma.js";
import type { Prisma } from "@prisma/client";
import { error } from "@sveltejs/kit";
import { google } from "googleapis";

export const load = async ({ parent, url }) => {
  const { session } = await parent();

  if (!session.tokens) error(401, "Account not authenticated with Google");

  const auth = new google.auth.OAuth2({ credentials: session.tokens as never });

  auth.on("tokens", async (tokens) => {
    console.log("Tokens updated");
    await prisma.googleUser.update({
      where: { id: session.id },
      data: { tokens: tokens as Prisma.InputJsonObject },
    });
  });

  const calendar = google.calendar({ version: "v3", auth });

  const { data: calendars } = await calendar.calendarList.list();

  const id = url.searchParams.get("id");

  if (id) {
    const { data: events } = await calendar.events.list({
      calendarId: id,
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
    });
    return {
      calendars: calendars.items ?? [],
      events: events.items ?? [],
    };
  }

  return {
    calendars: calendars.items ?? [],
  };
};
