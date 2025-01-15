import { prisma } from "$lib/server/prisma.js";
import { formgate } from "formgator/sveltekit";
import * as fg from "formgator";
import { error } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { me } = await parent();

  const tags = await prisma.tag.findMany({ where: { ownerId: me.id } });
  return { tags };
};

export const actions = {
  default: formgate(
    {
      name: fg.text({ required: true, maxlength: 64 }),
      color: fg.color().transform((color) => color.slice(1)),
    },
    async ({ name, color }, { locals }) => {
      if (!locals.session) error(401, "Unauthorized");

      await prisma.tag.create({
        data: { name, color, ownerId: locals.session.id },
      });
    },
  ),
};
