import { prisma } from "$lib/server/prisma.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: "Unauthorized" });
    const data = await request.formData();

    const result = z
      .object({
        username: z.string(),
        displayName: z.string(),
      })
      .safeParse({
        username: data.get("username"),
        displayName: data.get("display_name"),
      });

    if (!result.success)
      return fail(400, { validationErrors: result.error.flatten() });

    try {
      await prisma.user.create({
        data: {
          ...result.data,
          id: locals.session.id,
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        return fail(400, { error: "Username already exists" });
      return fail(500, { error: "Internal server error" });
    }

    redirect(307, "/");
  },
};
