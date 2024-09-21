import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import command from "eslint-plugin-command/config";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  command(),
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  ...eslintPluginSvelte.configs["flat/recommended"],
  eslintConfigPrettier,
  ...eslintPluginSvelte.configs["flat/prettier"],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
      parser: svelteParser,
      parserOptions: {
        parser: tsEslint.parser,
        extraFileExtensions: [".svelte"],
      },
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
      "**/.vercel",
      "**/.yarn",
      "**/build",
      "**/dist",
      "**/node_modules",
      "**/package",
      "**/src/paraglide",
    ],
  },
);
