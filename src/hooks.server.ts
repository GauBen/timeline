import { fetchAndPersistSession } from "$lib/auth.js";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.session = await fetchAndPersistSession(event);
  return resolve(event);
};
