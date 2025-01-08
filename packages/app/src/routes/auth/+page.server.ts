import { client } from "$lib/server/google.js";

export const load = () => {
  const url = client.generateAuthUrl({
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
