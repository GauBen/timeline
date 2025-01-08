import { env } from "$env/dynamic/private";
import { error } from "@sveltejs/kit";

export const load = async () => {
  if (!env.DEV_MODE) error(403, "Not allowed in production");
};
