import { client } from "$lib/server/google.js";

export const load = ({ request }) => {
  const url = client.generateAuthUrl({
    redirect_uri: new URL("/auth/callback-google", request.url).toString(),

    // offline means "produce tokens that can be used without user interaction"
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
    ],
  });

  return { url };
};
