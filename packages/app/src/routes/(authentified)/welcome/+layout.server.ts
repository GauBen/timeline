import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const me = locals.session?.user;
  if (me) redirect(307, "/");
};
