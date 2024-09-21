import { prisma } from "$lib/server/prisma.js";
import { fail } from "@sveltejs/kit";
import { z } from "zod";

export const load = async ({ parent }) => {
  const { me } = await parent();
  return {
    habits: await prisma.habit.findMany({ where: { userId: me.id } }),
  };
};

export const actions = {
  async create({ locals, request }) {
    if (!locals.session) return fail(401, { error: "Unauthorized" });

    const data = await request.formData();
    const input = data.get("name");
    const result = z.string().min(1).max(255).safeParse(input);

    if (!result.success)
      return fail(400, { input, validationErrors: result.error.flatten() });

    await prisma.habit.create({
      data: {
        name: result.data,
        userId: locals.session.id,
      },
    });
  },

  async remove({ locals, request }) {
    if (!locals.session) return fail(401, { error: "Unauthorized" });

    const data = await request.formData();
    const input = data.get("id");
    const result = z.string().pipe(z.coerce.bigint()).safeParse(input);

    if (!result.success)
      return fail(400, { input, validationErrors: result.error.flatten() });

    await prisma.habit.delete({
      where: { id: result.data, userId: locals.session.id },
    });
  },
};
