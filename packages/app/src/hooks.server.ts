import { fetchAndPersistSession } from "$lib/server/auth.js";
import { isAvailableLanguageTag, sourceLanguageTag } from "$lib/i18n.svelte.js";
import type { RequestEvent } from "@sveltejs/kit";

const getLanguage = ({ request, cookies }: RequestEvent) => {
  const acceptLanguage =
    cookies.get("language") ?? request.headers.get("accept-language");
  const language = acceptLanguage?.split(",")[0];
  return isAvailableLanguageTag(language) ? language : sourceLanguageTag;
};

export const handle = async ({ event, resolve }) => {
  event.locals.session = await fetchAndPersistSession(event);
  event.locals.language = getLanguage(event);

  return resolve(event, {
    // Replace %lang% with the language code
    transformPageChunk: ({ html }) =>
      html.replace("<html %lang%", `<html lang="${event.locals.language}"`),
  });
};
