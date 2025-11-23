/// @ts-check
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url:
      "file:" +
      path.join(
        process.env.PROJECT_CWD,
        ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/82cd99048785d06a0e330c75410253139e3b4b6b5c5123b3b6341082d74949d4.sqlite",
      ),
  },
});
