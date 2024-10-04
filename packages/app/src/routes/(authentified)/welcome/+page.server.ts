import { prisma } from "$lib/server/prisma.js";
import { timezones } from "$lib/server/tz.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { fail, redirect } from "@sveltejs/kit";
import * as fg from "formgator";
import { formgate } from "formgator/sveltekit";

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
  default: formgate(
    {
      username: fg.text({ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/ }),
      displayName: fg.text({ minlength: 1, maxlength: 255 }),
      timezone: fg.select(timezones, { required: true }),
    },
    async (data, { locals }) => {
      if (!locals.session) return fail(401, { error: "Unauthorized" });

      if (reserved.has(data.username.toLowerCase().replace(/s$/, "")))
        return fail(400, { error: "Username already exists" });

      try {
        await prisma.user.create({
          data: { ...data, id: locals.session.id },
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        )
          return fail(400, { error: "Username already exists" });
        console.error(error);
        return fail(500, { error: "Internal server error" });
      }

      redirect(307, "/");
    },
  ),
};
