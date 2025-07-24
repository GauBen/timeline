import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import unocss from "unocss/vite";
import { presetIcons } from "unocss";

export default defineConfig({
  plugins: [
    sveltekit(),
    unocss({
      presets: [
        presetIcons({
          scale: 1.25,
          extraProperties: {
            "display": "inline-block",
            "vertical-align": "text-bottom",
          },
        }),
      ],
    }),
  ],
  ssr: {
    noExternal: ["formgator"],
    external: ["db"],
  },
});
