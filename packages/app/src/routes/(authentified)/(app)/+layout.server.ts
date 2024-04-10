import { prisma } from "$lib/server/prisma.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { session } = await parent();
  const me = await prisma.user.findUnique({ where: { id: session.id } });
  if (!me) redirect(307, "/welcome");
  return { me };
};
