import { timezones } from "$lib/server/tz.js";
import { error, redirect } from "@sveltejs/kit";
import * as devalue from "devalue";
import * as fg from "formgator";
import { formfail, formgate } from "formgator/sveltekit";
import { locales } from "messages/runtime";

export const load = ({ locals }) => ({ email: locals.session!.email });

const reserved = new Set([
  // @keep-sorted
  "about",
  "account",
  "admin",
  "api",
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
      locale: fg.select(locales, { required: true }),
    },
    async (data, { locals, platform, cookies }) => {
      const token = cookies.get("session");
      if (!locals.session || !token) error(401, "Unauthorized");

      try {
        const user = await locals.prisma.user.create({
          data: { ...data, id: locals.session.id },
        });
        // Update the session to include the newly created user
        await platform!.env.SESSIONS.put(
          token,
          devalue.stringify({ ...locals.session, user }),
        );
      } catch {
        formfail({ username: "Username already in use" });
      }

      redirect(307, "/");
    },
  ),
};
