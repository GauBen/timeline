import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
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
      // Until https://github.com/sveltejs/eslint-plugin-svelte/issues/652 is fixed
      "svelte/valid-compile": "off",
    },
  },
  {
    ignores: [
      "**/.svelte-kit",
      "**/.vercel",
      "**/.yarn",
      "**/build",
      "**/node_modules",
      "**/package",
      "**/src/paraglide",
    ],
  },
);
