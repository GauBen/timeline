import { prisma } from "$lib/server/prisma.js";
import { Temporal } from "@js-temporal/polyfill";
import { error, redirect } from "@sveltejs/kit";

const parseDate = ({ year, month }: { year: string; month: string }) => {
  try {
    return Temporal.ZonedDateTime.from(
      {
        year: Number(year),
        month: Number(month),
        day: 1,
        timeZone: "Europe/Paris",
      },
      { overflow: "reject" },
    );
  } catch {
    error(400, "Invalid date");
  }
};

export const load = async ({ params, parent }) => {
  const { me, user } = await parent();
  const date = parseDate(params);

  const expected = date
    .toPlainDate()
    .toString()
    .replaceAll("-", "/")
    .slice(0, 7);

  if ([params.year, params.month].join("/") !== expected) {
    redirect(307, `${user ? "/" + user.username : ""}/${expected}`);
  }

  return {
    date: date.toString(),
    events: await prisma.event.findMany({
      where: {
        author: user
          ? { id: user.id }
          : { followers: { some: { followerId: me.id } } },
        date: {
          gte: date.toInstant().toString(),
          lt: date.add({ months: 1 }).toInstant().toString(),
        },
      },
      include: { author: true },
    }),
  };
};
