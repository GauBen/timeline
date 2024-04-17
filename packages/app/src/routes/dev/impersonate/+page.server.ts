import { env } from "$env/dynamic/private";
import { prisma } from "$lib/server/prisma.js";
import { error, redirect } from "@sveltejs/kit";
import { SignJWT } from "jose";

export const load = async () => {
  if (!env.JWT_DEV_SECRET) error(403, "Not allowed in production");

  type Rows = Array<{ id: string; email: string; username: string }>;
  return {
    users: await prisma.$queryRaw<Rows>`
      SELECT au.id, au.email, pu.username
      FROM auth.users au
      LEFT JOIN public.users pu ON au.id = pu.id
    `,
  };
};

export const actions = {
  default: async ({ cookies, request }) => {
    if (!env.JWT_DEV_SECRET) error(403, "Not allowed in production");

    const data = await request.formData();
    const id = String(data.get("id"));

    const secret = new TextEncoder().encode(env.JWT_DEV_SECRET);

    const jwt = await new SignJWT()
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setAudience("authenticated")
      .setSubject(id)
      .setExpirationTime("1d")
      .sign(secret);

    cookies.set("access_token", jwt, {
      path: "/",
      expires: new Date(Date.now() + 86400 * 1000),
    });

    redirect(307, "/");
  },
};
