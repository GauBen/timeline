import { client } from "$lib/server/google.js";
import { prisma } from "$lib/server/prisma.js";
import { error, redirect } from "@sveltejs/kit";
import * as devalue from "devalue";
import { jwtDecode } from "jwt-decode";
import { nanoid } from "nanoid";

export const GET = async ({ url, cookies, platform }) => {
  const code = url.searchParams.get("code");
  if (!code) error(400, "Invalid code");

  const { tokens } = await client.getToken({
    code,
    redirect_uri: new URL(url.pathname, url.origin).toString(),
  });
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
    create: {
      email: user.email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    },
    select: { id: true, email: true, user: true },
  });

  const token = nanoid();
  platform!.env.SESSIONS.put(token, devalue.stringify(googleUser), {
    expirationTtl: 4e7,
  });

  cookies.set("session", token, {
    path: "/",
    expires: new Date(Date.now() + 4e10),
  });

  redirect(307, "/");
};
