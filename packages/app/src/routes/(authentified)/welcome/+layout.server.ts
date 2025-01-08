import { prisma } from "$lib/server/prisma.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { session } = await parent();
  const me = await prisma.user.findUnique({ where: { googleId: session.id } });
  if (me) redirect(307, "/");
};
