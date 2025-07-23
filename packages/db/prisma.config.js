import { getPlatformProxy } from "wrangler";
import { PrismaD1 } from "@prisma/adapter-d1";
import path from "node:path";

const platform = await getPlatformProxy({
  persist: {
    path: path.join(process.env.PROJECT_CWD, ".wrangler/state/v3"),
  },
});
const d1 = new PrismaD1(platform.env.DB);

/** @type {import("prisma").PrismaConfig} */
export default {
  earlyAccess: true,

  adapter: () => d1,

  studio: {
    // The studio requires its own adapter for now
    adapter: () => d1,
  },
};
