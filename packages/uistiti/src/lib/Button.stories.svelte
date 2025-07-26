<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Button from "./Button.svelte";
  import { fn } from "storybook/test";
  import { colors, variants } from "./definitions.js";

  const keys = Object.keys as <T>(o: T) => Array<keyof T>;

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Button",
    component: Button,
    tags: ["autodocs"],
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
    args: {
      onclick: fn(),
    },
  });
</script>

<Story name="Default">Click me</Story>

<Story name="All combinations">
  {#snippet template()}
    <table>
      <tbody>
        {#each keys(variants) as variant (variant)}
          <tr>
            {#each keys(colors) as color (color)}
              <td>
                <Button {variant} {color} style="width:100%">
                  {variant}
                  {color}
                </Button>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</Story>
