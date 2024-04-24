import { page } from "$app/stores";
import { derived } from "svelte/store";

export * as m from "$paraglide/messages.js";
export {
  isAvailableLanguageTag,
  languageTag,
  setLanguageTag,
} from "$paraglide/runtime.js";

export const language = derived(page, ($page) => $page.data.language);

const formatter = derived(
  language,
  ($language) =>
    new Intl.RelativeTimeFormat($language, {
      numeric: "auto",
    }),
);
const thresholds = {
  seconds: 60,
  minutes: 60,
  hours: 24,
  days: 30.4375,
  months: 12,
};
export const format = derived(formatter, ($formatter) => (date: Date) => {
  let diff = (date.getTime() - Date.now()) / 1000;
  for (const [unit, threshold] of Object.entries(thresholds)) {
    if (Math.abs(diff) < threshold) {
      return $formatter.format(
        Math.round(diff),
        unit as Intl.RelativeTimeFormatUnit,
      );
    }
    diff /= threshold;
  }
  return $formatter.format(Math.round(diff), "years");
});
