import { env } from "$env/dynamic/public";
import type { Session, User } from "@supabase/supabase-js";
import type { RequestEvent } from "@sveltejs/kit";

/**
 * Resolves a Supabase Auth API route. This used to be a static variable but it
 * cannot work with a dynamic environment.
 */
export const authAPI = (route: string) =>
  new URL("auth/v1/" + route, env.PUBLIC_SUPABASE_URL);

export const fetchAndPersistSession = async ({
  cookies,
  fetch,
}: RequestEvent) => {
  const accessToken = cookies.get("access_token");
  const refreshToken = cookies.get("refresh_token");

  if (accessToken) {
    const response = await fetch(authAPI("user"), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ApiKey: env.PUBLIC_SUPABASE_ANON_KEY,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as User;
      return data;
    }

    cookies.delete("access_token", { path: "/" });
  }

  if (refreshToken) {
    const response = await fetch(authAPI("token?grant_type=refresh_token"), {
      method: "POST",
      headers: {
        "ApiKey": env.PUBLIC_SUPABASE_ANON_KEY,
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as Session;
      cookies.set("access_token", data.access_token, {
        path: "/",
        expires: new Date(Date.now() + data.expires_in * 1000),
      });
      cookies.set("refresh_token", data.refresh_token, {
        path: "/",
        expires: new Date(Date.now() + 4e10),
      });
      return data.user;
    }

    cookies.delete("refresh_token", { path: "/" });
  }
};
