import { env } from "$env/dynamic/private";
import { prisma } from "$lib/server/prisma.js";
import { error, redirect } from "@sveltejs/kit";

export const load = async () => {
  if (!env.JWT_DEV_SECRET) error(403, "Not allowed in production");
  return { users: await prisma.authUser.findMany({ include: { user: true } }) };
};

export const actions = {
  default: async ({ cookies, request }) => {
    if (!env.JWT_DEV_SECRET) error(403, "Not allowed in production");

    const data = await request.formData();
    const id = String(data.get("id"));

    const secret = new TextEncoder().encode(env.JWT_DEV_SECRET);

    // Avoid importing dev dependencies at the top level to reduce production
    // memory footprint and attack surface
    const { SignJWT } = await import("jose");
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
