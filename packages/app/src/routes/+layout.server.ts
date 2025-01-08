import { env } from "$env/dynamic/private";
import { timezones } from "$lib/server/tz.js";

export const load = ({ locals }) => ({
  language: locals.language,
  devMode: Boolean(env.DEV_MODE),
  timezones: [...timezones],
});
