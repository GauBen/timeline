import { client } from "$lib/server/google.js";
import { prisma } from "$lib/server/prisma.js";
import type { Prisma } from "@prisma/client";
import { redirect } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { jwtDecode } from "jwt-decode";
import { nanoid } from "nanoid";

export const GET = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  if (!code) error(400, "Invalid code");

  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) error(400, "Invalid token");

  const user = jwtDecode<{
    // Useful fields in the token
    email: string;
    email_verified: boolean;
    name: string;
    picture: string;
    given_name: string;
    family_name: string;
  }>(tokens.id_token);

  const googleUser = await prisma.googleUser.upsert({
    where: { email: user.email },
    create: { email: user.email, tokens: tokens as Prisma.InputJsonObject },
    update: { tokens: tokens as Prisma.InputJsonObject },
  });

  const session = await prisma.session.create({
    data: {
      googleUserId: googleUser.id,
      token: nanoid(),
      expiresAt: new Date(Date.now() + 4e10),
    },
  });

  cookies.set("session", session.token, {
    path: "/",
    expires: session.expiresAt,
  });

  redirect(307, `/`);
};
