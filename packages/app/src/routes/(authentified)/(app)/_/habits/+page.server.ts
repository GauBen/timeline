import { fail } from "@sveltejs/kit";
import * as fg from "formgator";

export const load = async ({ parent, locals }) => {
  const { me } = await parent();
  return {
    habits: await locals.prisma.habit.findMany({ where: { userId: me.id } }),
  };
};

export const actions = {
  async create({ locals, request }) {
    if (!locals.session) return fail(401, { error: "Unauthorized" });

    const result = fg
      .form({ name: fg.text({ required: true, minlength: 1, maxlength: 255 }) })
      .safeParse(await request.formData());

    if (!result.success) return fail(400, { error: result.error });

    await locals.prisma.habit.create({
      data: {
        name: result.data.name,
        userId: locals.session.id,
      },
    });
  },

  async remove({ locals, request }) {
    if (!locals.session) return fail(401, { error: "Unauthorized" });

    const result = fg
      .form({ id: fg.text({ required: true }).transform(Number) })
      .safeParse(await request.formData());

    if (!result.success) return fail(400, { validationErrors: result.error });

    await locals.prisma.habit.delete({
      where: { id: result.data.id, userId: locals.session.id },
    });
  },
};
