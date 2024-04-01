import { prisma } from "$lib/server/prisma.js";
import { Temporal } from "@js-temporal/polyfill";
import { error, redirect } from "@sveltejs/kit";

const parseDate = ({
  year,
  month,
  day,
}: {
  year: string;
  month: string;
  day: string;
}) => {
  try {
    return Temporal.ZonedDateTime.from(
      {
        year: Number(year),
        month: Number(month),
        day: Number(day),
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

  const expected = date.toPlainDate().toString().replaceAll("-", "/");

  if ([params.year, params.month, params.day].join("/") !== expected) {
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
          lt: date.add({ days: 1 }).toInstant().toString(),
        },
      },
      include: { author: true },
    }),
  };
};
