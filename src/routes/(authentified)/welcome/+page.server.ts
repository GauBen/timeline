import { prisma } from "$lib/server/prisma.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: "Unauthorized" });
    const data = await request.formData();
    const input = {
      username: String(data.get("username")),
      displayName: String(data.get("display_name")),
    };

    const result = z
      .object({
        username: z.string().regex(/^[a-zA-Z0-9_]{3,20}$/),
        displayName: z.string().min(1).max(255),
      })
      .safeParse(input);

    if (!result.success)
      return fail(400, { input, validationErrors: result.error.flatten() });

    try {
      await prisma.user.create({
        data: {
          ...result.data,
          id: locals.session.id,
          // Make the user follow themselves
          followers: {
            create: {
              followingId: locals.session.id,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        return fail(400, { input, error: "Username already exists" });
      console.error(error);
      return fail(500, { input, error: "Internal server error" });
    }

    redirect(307, "/");
  },
};
