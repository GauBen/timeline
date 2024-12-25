import { prisma } from "$lib/server/prisma.js";
import { formgate } from "formgator/sveltekit";
import * as fg from "formgator";
import { error } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { me } = await parent();
  const entries = await prisma.journalEntry.findMany({
    where: { authorId: me.id },
    orderBy: { date: "asc" },
  });
  return { entries };
};

export const actions = {
  default: formgate(
    {
      body: fg.text(),
      date: fg
        .date({
          required: true,
          // Don't allow dates in the future (for now)
          max: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        })
        .transform((date) => date + "T00:00:00Z"),
    },
    async ({ date, body }, { locals }) => {
      if (!locals.session) error(401, "Unauthorized");

      if (body) {
        await prisma.journalEntry.upsert({
          where: { authorId_date: { authorId: locals.session.id, date } },
          create: { authorId: locals.session.id, date, body },
          update: { body },
        });
      } else {
        await prisma.journalEntry.deleteMany({
          where: { authorId: locals.session.id, date },
        });
      }
    },
  ),
};
