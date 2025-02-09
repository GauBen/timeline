import { env } from "$env/dynamic/private";
import type { GoogleUser } from "@prisma/client";
import { google } from "googleapis";
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
