<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Textarea from "./Textarea.svelte";
  import { colors, variants } from "./definitions.js";

  const keys = Object.keys as <T>(o: T) => Array<keyof T>;

  const { Story } = defineMeta({
    title: "Textarea",
    component: Textarea,
    argTypes: {
      color: {
        control: { type: "select" },
        options: keys(colors),
      },
      variant: {
        control: { type: "select" },
        options: keys(variants),
      },
    },
  });
</script>

<Story name="Default" />
