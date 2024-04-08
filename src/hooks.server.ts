import { fetchAndPersistSession } from "$lib/auth.js";
import { isAvailableLanguageTag } from "$paraglide/runtime.js";
import type { Handle, RequestEvent } from "@sveltejs/kit";

const getLanguage = ({ request, cookies }: RequestEvent) => {
  const acceptLanguage =
    cookies.get("language") ?? request.headers.get("accept-language");
  const language = acceptLanguage ? acceptLanguage.split(",")[0] : "en-US";
  return isAvailableLanguageTag(language) ? language : "en-US";
};

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.session = await fetchAndPersistSession(event);
  event.locals.language = getLanguage(event);

  let replacedLangAttribute = false;
  return resolve(event, {
    transformPageChunk: ({ html }) => {
      // Replace the first %lang% of the response with the language tag

      if (html.includes("%lang%") && !replacedLangAttribute) {
        replacedLangAttribute = true;
        return html.replace("%lang%", event.locals.language);
      }

      return html;
    },
  });
};
