import { getPlatformProxy } from "wrangler";
import { PrismaD1 } from "@prisma/adapter-d1";
import path from "node:path";

const adapter = async () => {
  const platform = await getPlatformProxy({
    persist: {
      path: path.join(process.env.PROJECT_CWD, ".wrangler/state/v3"),
    },
  });
  return new PrismaD1(
    /** @type {import("@cloudflare/workers-types").D1Database} */ (
      platform.env.DB
    ),
  );
};

/** @type {import("prisma").PrismaConfig} */
export default {
  experimental: {
    adapter: true,
    studio: true,
  },

  adapter,

  studio: {
    // The studio requires its own adapter for now
    adapter,
  },
};
