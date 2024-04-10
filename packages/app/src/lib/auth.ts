import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "$env/static/public";
import type { Session, User } from "@supabase/supabase-js";
import type { RequestEvent } from "@sveltejs/kit";

export const authAPI = new URL("auth/v1/", PUBLIC_SUPABASE_URL);

export const fetchAndPersistSession = async ({
  cookies,
  fetch,
}: RequestEvent) => {
  const accessToken = cookies.get("access_token");
  const refreshToken = cookies.get("refresh_token");

  if (accessToken) {
    const response = await fetch(new URL("user", authAPI), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ApiKey: PUBLIC_SUPABASE_ANON_KEY,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as User;
      return data;
    }

    cookies.delete("access_token", { path: "/" });
  }

  if (refreshToken) {
    const response = await fetch(
      new URL("token?grant_type=refresh_token", authAPI),
      {
        method: "POST",
        headers: {
          "ApiKey": PUBLIC_SUPABASE_ANON_KEY,
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      },
    );

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
