import { redirect } from "@sveltejs/kit";

export const GET = async ({ cookies }) => {
  cookies.delete("access_token", { path: "/" });
  cookies.delete("refresh_token", { path: "/" });
  redirect(307, "/");
};
