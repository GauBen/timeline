import { sveltekit } from "@sveltejs/kit/vite";
import icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ command }) => ({
  plugins: [
    command === "serve" && cloudflare(),
    sveltekit(),
    icons({ compiler: "svelte", scale: 1.25, defaultClass: "icon" }),
  ],
  ssr: {
    noExternal: ["formgator"],
    external: ["db"],
  },
}));
