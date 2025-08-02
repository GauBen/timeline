import { page } from "$app/state";
import { m } from "messages";

const thresholds = {
  seconds: 60,
  minutes: 60,
  hours: 24,
  days: 30.4375,
  months: 12,
};

export default {
  get today() {
    return Temporal.Now.plainDateTimeISO(page.data.me?.timezone);
  },
  get locale() {
    return page.data.locale;
  },
  get formatter() {
    return new Intl.RelativeTimeFormat(this.locale, {
      numeric: "auto",
    });
  },
  format(date: Date) {
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
  },
  formatDay(day: Temporal.PlainDate) {
    const { today } = this;
    if (day.equals(today.subtract({ days: 1 }))) return m.yesterday();
    if (day.equals(today)) return m.today();
    if (day.equals(today.add({ days: 1 }))) return m.tomorrow();
    return day.toLocaleString(this.locale, {
      month: "short",
      day: "numeric",
    });
  },
  dayParts(day: Temporal.PlainDate) {
    return {
      number: day.toLocaleString(this.locale, { day: "numeric" }),
      weekday: day.toLocaleString(this.locale, { weekday: "short" }),
    };
  },
  formatMonth(month: number) {
    return new Temporal.PlainDate(2025, month, 1).toLocaleString(this.locale, {
      month: "long",
    });
  },
};
