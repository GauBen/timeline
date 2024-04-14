import { authAPI } from "$lib/auth.js";
import { error, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import type { Session } from "@supabase/supabase-js";

export const GET = async ({ cookies, fetch, url }) => {
  const code = url.searchParams.get("code") as string;
  const next = url.searchParams.get("next") ?? "/";

  const challenge = cookies.get("pkce_challenge");

  if (!challenge) error(400, "Missing login integrity check");

  const response = await fetch(authAPI("token?grant_type=pkce"), {
    method: "POST",
    headers: {
      "ApiKey": env.PUBLIC_SUPABASE_ANON_KEY,
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: challenge,
    }),
  });

  cookies.delete("pkce_challenge", { path: "/auth/callback" });

  if (!response.ok) error(response.status, response.statusText);

  const data = (await response.json()) as Session;

  cookies.set("access_token", data.access_token, {
    path: "/",
    expires: new Date(Date.now() + data.expires_in * 1000),
  });
  cookies.set("refresh_token", data.refresh_token, {
    path: "/",
    expires: new Date(Date.now() + 4e10),
  });

  throw redirect(307, `/${next.slice(1)}`);
};
