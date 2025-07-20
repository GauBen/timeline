/// @ts-check
import { getPlatformProxy } from "wrangler";
import { PrismaD1 } from "@prisma/adapter-d1";

/** @type {import("prisma").PrismaConfig} */
export default {
  earlyAccess: true,
  async adapter() {
    const platform = await getPlatformProxy({
      configPath: "../app/wrangler.json",
      persist: { path: "../app/.wrangler/state/v3" },
    });
    const d1 = new PrismaD1(platform.env.DB);
    const shadowD1 = new PrismaD1(platform.env.SHADOW_DB);
    return {
      ...d1,
      connectToShadowDb: shadowD1.connect,
    };
  },
};
