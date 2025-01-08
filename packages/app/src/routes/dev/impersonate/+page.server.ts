import { env } from "$env/dynamic/private";
import { prisma } from "$lib/server/prisma.js";
import { error, redirect } from "@sveltejs/kit";
import { formgate } from "formgator/sveltekit";
import * as fg from "formgator";
import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

export const load = async () => ({
  users: await prisma.googleUser.findMany({ include: { user: true } }),
});

export const actions = {
  login: formgate(
    { id: fg.number({ required: true }) },
    async ({ id }, { cookies }) => {
      if (!env.DEV_MODE) error(403, "Not allowed in production");

      const session = await prisma.session.create({
        data: {
          token: nanoid(),
          expiresAt: new Date(Date.now() + 4e10),
          googleUserId: id,
        },
      });

      cookies.set("session", session.token, {
        path: "/",
        expires: session.expiresAt,
      });

      redirect(307, "/");
    },
  ),

  register: formgate(
    { email: fg.email({ required: true }) },
    async ({ email }) => {
      if (!env.DEV_MODE) error(403, "Not allowed in production");

      await prisma.googleUser.create({
        data: { email, tokens: Prisma.JsonNull },
      });
    },
  ),
};
