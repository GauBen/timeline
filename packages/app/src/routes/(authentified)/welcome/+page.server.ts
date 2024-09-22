import { prisma } from "$lib/server/prisma.js";
import { timezones } from "$lib/server/tz.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

const reserved = new Set([
  // @keep-sorted
  "about",
  "account",
  "admin",
  "article",
  "auth",
  "blog",
  "calendar",
  "category",
  "comment",
  "contact",
  "dashboard",
  "dev",
  "doc",
  "event",
  "faq",
  "habit",
  "help",
  "home",
  "index",
  "login",
  "logout",
  "new",
  "page",
  "popular",
  "post",
  "privacy",
  "profile",
  "recent",
  "register",
  "search",
  "setting",
  "signin",
  "signup",
  "support",
  "tag",
  "term",
  "trending",
  "user",
  "welcome",
  "wiki",
]);

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.session) return fail(401, { error: "Unauthorized" });
    const data = await request.formData();
    const input = {
      username: String(data.get("username")),
      displayName: String(data.get("display_name")),
      timezone: String(data.get("timezone")),
    };

    const result = z
      .object({
        username: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/),
        displayName: z.string().min(1).max(255),
        timezone: z.string().refine((tz) => timezones.has(tz)),
      })
      .safeParse(input);

    if (!result.success)
      return fail(400, { input, validationErrors: result.error.flatten() });

    if (reserved.has(input.username.toLowerCase().replace(/s$/, "")))
      return fail(400, { input, error: "Username already exists" });

    try {
      await prisma.user.create({
        data: { ...result.data, id: locals.session.id },
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
