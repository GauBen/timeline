<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Input from "./Input.svelte";
  import { colors, variants } from "./definitions.js";
  import { createRawSnippet } from "svelte";

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
    args: {
      children: createRawSnippet(() => ({ render: () => "Click me" })),
    },
  });
</script>

<Story name="Default" />

<Story name="All combinations">
  <table>
    <tbody>
      {#each keys(variants) as variant}
        <tr>
          {#each keys(colors) as color}
            <td>
              <Input {variant} {color} />
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</Story>
