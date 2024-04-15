import { env } from "$env/dynamic/private";

export const load = ({ locals }) => ({
  language: locals.language,
  devMode: Boolean(env.JWT_DEV_SECRET),
});
