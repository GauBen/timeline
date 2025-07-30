import type { StorybookConfig } from "@storybook/sveltekit";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

/**
 * This function is used to resolve the absolute path of a package. It is needed
 * in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return fileURLToPath(
    new URL(".", import.meta.resolve(join(value, "package.json"))),
  );
}

export default {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
  addons: [
    getAbsolutePath("@storybook/addon-svelte-csf"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/sveltekit"),
    options: {},
  },
  viteFinal: (config) =>
    mergeConfig(config, { server: { fs: { allow: ["./dist"] } } }),
} satisfies StorybookConfig;
