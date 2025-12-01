import { createUserClient, syncCalendar } from "$lib/server/google.js";

export const POST = async ({ request, locals }) => {
  if (request.headers.get("X-Goog-Resource-State") !== "exists")
    return new Response("OK");

  if (!request.headers.has("X-Goog-Channel-ID"))
    return new Response("Invalid channel", { status: 400 });

  try {
    const id = Number(request.headers.get("X-Goog-Channel-ID")!);
    const sync = await locals.prisma.googleCalendarSync.findUniqueOrThrow({
      where: { id },
      include: { user: { select: { googleUser: true } } },
    });

    const auth = createUserClient(locals.prisma, sync.user.googleUser);
    await syncCalendar(locals.prisma, auth, sync);

    return new Response("OK");
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
};
