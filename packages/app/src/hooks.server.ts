import { isAvailableLanguageTag, sourceLanguageTag } from "$lib/i18n.svelte.js";
import type { RequestEvent } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma.js";

const getLanguage = ({ request, cookies }: RequestEvent) => {
  const acceptLanguage =
    cookies.get("language") ?? request.headers.get("accept-language");
  const language = acceptLanguage?.split(",")[0];
  return isAvailableLanguageTag(language) ? language : sourceLanguageTag;
};

export const handle = async ({ event, resolve }) => {
  // Load session if there is a session cookie
  const token = event.cookies.get("session");
  if (token) {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { googleUser: true },
    });
    if (session) event.locals.session = session.googleUser;
    else event.cookies.delete("session", { path: "/" });
  }

  event.locals.language = getLanguage(event);

  return resolve(event, {
    // Replace %lang% with the language code
    transformPageChunk: ({ html }) =>
      html.replace("<html %lang%", `<html lang="${event.locals.language}"`),
  });
};
