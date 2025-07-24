import { env } from "$env/dynamic/private";
import { prisma } from "$lib/server/prisma.js";
import { error, redirect } from "@sveltejs/kit";
import * as devalue from "devalue";
import * as fg from "formgator";
import { formgate } from "formgator/sveltekit";
import { nanoid } from "nanoid";

export const load = async () => ({
  users: await prisma.googleUser.findMany({ include: { user: true } }),
});

export const actions = {
  login: formgate(
    { id: fg.number({ required: true }) },
    async ({ id }, { cookies, platform }) => {
      if (!env.DEV_MODE) error(403, "Not allowed in production");

      const googleUser = await prisma.googleUser.findUniqueOrThrow({
        where: { id },
        select: { id: true, email: true, user: true },
      });

      const token = nanoid();
      await platform!.env.SESSIONS.put(token, devalue.stringify(googleUser), {
        expirationTtl: 4e7,
      });

      cookies.set("session", token, {
        path: "/",
        expires: new Date(Date.now() + 4e10),
      });

      redirect(307, "/");
    },
  ),

  register: formgate(
    { email: fg.email({ required: true }) },
    async ({ email }) => {
      if (!env.DEV_MODE) error(403, "Not allowed in production");

      await prisma.googleUser.create({ data: { email } });
    },
  ),
};
