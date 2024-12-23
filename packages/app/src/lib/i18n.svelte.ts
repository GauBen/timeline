import { page } from "$app/state";
import * as m from "$paraglide/messages.js";

export { m }; // https://github.com/sveltejs/svelte/issues/14768
export {
  isAvailableLanguageTag,
  languageTag,
  setLanguageTag,
} from "$paraglide/runtime.js";

const thresholds = {
  seconds: 60,
  minutes: 60,
  hours: 24,
  days: 30.4375,
  months: 12,
};

export default {
  get language() {
    return page.data.language;
  },
  get formatter() {
    return new Intl.RelativeTimeFormat(this.language, {
      numeric: "auto",
    });
  },
  get format() {
    return (date: Date) => {
      let diff = (date.getTime() - Date.now()) / 1000;
      for (const [unit, threshold] of Object.entries(thresholds)) {
        if (Math.abs(diff) < threshold) {
          return this.formatter.format(
            Math.round(diff),
            unit as Intl.RelativeTimeFormatUnit,
          );
        }
        diff /= threshold;
      }
      return this.formatter.format(Math.round(diff), "years");
    };
  },
};
