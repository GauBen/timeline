<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Select from "./Select.svelte";
  import { fn } from "storybook/test";
  import { colors, variants } from "./definitions.js";

  const keys = Object.keys as <T>(o: T) => Array<keyof T>;

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Select",
    component: Select,
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

<Story name="Default">
  <option>Select</option>
</Story>

<Story name="All combinations">
  {#snippet template()}
    <table>
      <tbody>
        {#each keys(variants) as variant (variant)}
          <tr>
            {#each keys(colors) as color (color)}
              <td>
                <Select {variant} {color}>
                  <option>
                    {variant}
                    {color}
                  </option>
                </Select>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</Story>
