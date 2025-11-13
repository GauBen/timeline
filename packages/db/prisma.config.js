/// @ts-check
import { PrismaD1 } from "@prisma/adapter-d1";
import path from "node:path";
import { defineConfig } from "prisma/config";
import { getPlatformProxy } from "wrangler";

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

export default defineConfig({
  engine: "js",
  experimental: {
    adapter: true,
    studio: true,
  },

  adapter,

  studio: {
    // The studio requires its own adapter for now
    adapter,
  },
});
