import { client } from "$lib/server/google.js";
import { google } from "googleapis";

export const GET = async ({ url }) => {
  const code = url.searchParams.get("code") as string;
  const { tokens } = await client.getToken(code);
  // Persist tokens

  // Prototyping
  const auth = new google.auth.OAuth2();
  auth.setCredentials(tokens);
  const calendar = await google.calendar({ version: "v3", auth });
  const colors = await calendar.colors.get();
  console.log(colors.data);
  const calendars = await calendar.calendarList.list();
  console.log(calendars.data);
};
