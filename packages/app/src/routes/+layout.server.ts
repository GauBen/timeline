import { env } from "$env/dynamic/private";
import { timezones } from "$lib/server/tz.js";

export const load = ({ locals }) => ({
  locale: locals.locale,
  devMode: Boolean(env.DEV_MODE),
  timezones: [...timezones],
});
