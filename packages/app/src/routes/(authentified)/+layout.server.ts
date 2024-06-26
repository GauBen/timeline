import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  if (!locals.session) redirect(307, "/auth");

  return { session: locals.session };
};
