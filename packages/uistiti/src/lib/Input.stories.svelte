<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Input from "./Input.svelte";
  import { colors, variants } from "./definitions.js";

  const keys = Object.keys as <T>(o: T) => Array<keyof T>;

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Input",
    component: Input,
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
  });
</script>

<Story name="Default" />

<Story name="All combinations">
  {#snippet template()}
    <table>
      <tbody>
        {#each keys(variants) as variant (variant)}
          <tr>
            {#each keys(colors) as color (color)}
              <td>
                <Input {variant} {color} />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</Story>
