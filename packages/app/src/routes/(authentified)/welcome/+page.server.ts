import { prisma } from "$lib/server/prisma.js";
import { timezones } from "$lib/server/tz.js";
import { error, redirect } from "@sveltejs/kit";
import * as fg from "formgator";
import { formfail, formgate } from "formgator/sveltekit";
import { availableLanguageTags } from "messages/runtime";
import { randomUUID } from "node:crypto";

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
  "journal",
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
      username: fg
        .text({
          required: true,
          pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
        })
        .refine(
          (value) => !reserved.has(value.toLowerCase().replace(/s$/, "")),
          "Username already exists",
        ),
      displayName: fg.text({ required: true, minlength: 1, maxlength: 255 }),
      timezone: fg.select(timezones, { required: true }),
      language: fg.select(availableLanguageTags, { required: true }),
    },
    async (data, { locals }) => {
      if (!locals.session) error(401, "Unauthorized");

      try {
        await prisma.user.create({
          data: {
            ...data,
            googleId: locals.session.id,
            email: locals.session.email,
            id: randomUUID(),
          },
        });
      } catch {
        formfail({ username: "Username already in use" });
      }

      redirect(307, "/");
    },
  ),
};
