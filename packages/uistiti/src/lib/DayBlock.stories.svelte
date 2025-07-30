<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DayBlock from "./DayBlock.svelte";

  const { Story } = defineMeta({
    title: "DayBlock",
    component: DayBlock,
    tags: ["autodocs"],
    args: {
      number: "27",
      weekday: "Mon",
      selected: false,
    },
  });
</script>

<Story name="Default" />

<Story name="Selected" args={{ selected: true }} />
