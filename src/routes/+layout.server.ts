import { isAvailableLanguageTag } from "$paraglide/runtime.js";

export const load = ({ request, cookies }) => {
  const acceptLanguage =
    cookies.get("language") ?? request.headers.get("accept-language");
  const language = acceptLanguage ? acceptLanguage.split(",")[0] : "en-US";
  return isAvailableLanguageTag(language)
    ? { language }
    : { language: "en-US" as const };
};
