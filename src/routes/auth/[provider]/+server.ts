import { authAPI } from "$lib/auth.js";
import { error, redirect } from "@sveltejs/kit";

export const GET = async ({ cookies, params, url }) => {
  if (params.provider !== "google") error(404, "Not found");

  const authUrl = new URL("authorize", authAPI);

  // Basic OAuth2 params
  authUrl.searchParams.set("provider", params.provider);
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set(
    "redirect_to",
    new URL("/auth/callback", url).toString(),
  );

  // Create a PKCE challenge
  const challenge = Buffer.from(
    crypto.getRandomValues(new Uint8Array(24)),
  ).toString("base64url");
  const hash = Buffer.from(
    await crypto.subtle.digest("SHA-256", Buffer.from(challenge, "ascii")),
  ).toString("base64url");

  // Send the challenge to the client
  cookies.set("pkce_challenge", challenge, { path: "/auth/callback" });

  // Send the hash to the auth server
  authUrl.searchParams.set("code_challenge", hash);
  authUrl.searchParams.set("code_challenge_method", "s256");

  redirect(307, authUrl);
};
