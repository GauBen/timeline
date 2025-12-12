import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "node:path";

/** @type {import("@sveltejs/kit").Config} */
export default {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      platformProxy: {
        persist: {
          path: path.join(process.env.PROJECT_CWD ?? ".", ".wrangler/state/v3"),
        },
      },
    }),

    experimental: {
      remoteFunctions: true,
    },
  },

  compilerOptions: {
    experimental: {
      async: true,
    },
  },
};
