import { env } from "$env/dynamic/private";
import { prisma } from "$lib/server/prisma.js";
import { PrismaPg } from "@prisma/adapter-pg";
import type { RequestEvent } from "@sveltejs/kit";
import { PrismaClient } from "db";
import { baseLocale, isLocale } from "messages/runtime";

const getSession = async ({ cookies }: RequestEvent) => {
  const token = cookies.get("session");
  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { googleUser: true },
    });
    if (session) return session.googleUser;
    cookies.delete("session", { path: "/" });
  }
};

const getLocale = ({ request, cookies }: RequestEvent) => {
  const userLocales =
    cookies.get("locale") ?? request.headers.get("accept-language");
  const userLocale = userLocales?.split(",")[0];
  return isLocale(userLocale) ? userLocale : baseLocale;
};

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const handle = async ({ event, resolve }) => {
  event.locals.prisma = new PrismaClient({ adapter });
  event.locals.session = await getSession(event);
  event.locals.locale = getLocale(event);

  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace("<html %lang%", `<html lang="${event.locals.locale}"`),
  });
};
