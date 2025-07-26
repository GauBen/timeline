import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import command from "eslint-plugin-command/config";
import storybook from "eslint-plugin-storybook";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

export default ts.config(
  command(),
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs["flat/recommended"],
  prettier,
  svelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { parser: ts.parser },
    },
    rules: {
      // Still unstable
      "svelte/no-unused-svelte-ignore": "off",
      "svelte/valid-compile": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [
      "**/.svelte-kit",
      "**/.wrangler",
      "**/.yarn",
      "**/build",
      "**/dist",
      "**/node_modules",
      "**/package",
      "**/src/paraglide",
    ],
  },
  storybook.configs["flat/recommended"],
);
