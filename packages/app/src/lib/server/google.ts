import { env } from "$env/dynamic/private";
import { google } from "googleapis";

export const client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5173/auth/callback-google",
);
