import { prisma } from "$lib/server/prisma.js";
import { timezones } from "$lib/server/tz.js";
import { error } from "@sveltejs/kit";
import * as devalue from "devalue";
import * as fg from "formgator";
import { formgate } from "formgator/sveltekit";
import { locales } from "messages/runtime";

export const actions = {
  default: formgate(
    {
      locale: fg.select(locales, { required: true }),
      timezone: fg.select(timezones, { required: true }),
    },
    async (data, { cookies, locals, platform }) => {
      const token = cookies.get("session");
      if (!token || !locals.session?.user) return error(401);

      cookies.set("locale", data.locale, {
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        httpOnly: false,
      });

      const user = await prisma.user.update({
        where: { id: locals.session.user.id },
        data,
      });

      await platform!.env.SESSIONS.put(
        token,
        devalue.stringify({ ...locals.session, user }),
      );
    },
  ),
};
