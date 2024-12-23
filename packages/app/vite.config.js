import { sveltekit } from "@sveltejs/kit/vite";
import icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
    icons({ compiler: "svelte", scale: 1.25, defaultClass: "icon" }),
  ],
  css: {
    preprocessorOptions: {
      scss: { api: "modern" },
    },
  },
  ssr: { noExternal: ["formgator"] },
});
