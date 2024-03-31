import { prisma } from "$lib/server/prisma.js";
import { fail } from "@sveltejs/kit";
import { z } from "zod";

export const load = async ({ parent }) => {
  const { me } = await parent();
  return {
    events: await prisma.event.findMany({
      where: {
        author: {
          followers: {
            some: {
              followerId: me.id,
            },
          },
        },
      },
      include: {
        author: true,
      },
    }),
  };
};

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: "Unauthorized" });
    const data = await request.formData();
    const input = {
      body: String(data.get("body")),
      date: String(data.get("date")),
    };

    const result = z
      .object({
        body: z.string().min(1).max(1024),
        date: z.string().pipe(z.coerce.date()),
      })
      .safeParse(input);

    if (!result.success)
      return fail(400, { input, validationErrors: result.error.flatten() });

    return prisma.event.create({
      data: {
        ...result.data,
        authorId: locals.session.id,
        duration: 0,
      },
    });
  },
};
