import { client } from "$lib/server/google.js";

export const load = ({ request }) => {
  const url = client.generateAuthUrl({
    redirect_uri: new URL("/auth/callback-google", request.url).toString(),
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
    ],

    // Combination of settings to get a refresh token
    // https://github.com/googleapis/google-api-nodejs-client/issues/750#issuecomment-368873635
    access_type: "offline",
    prompt: "consent",
  });

  return { url };
};
