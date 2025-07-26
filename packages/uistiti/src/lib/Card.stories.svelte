<script module lang="ts">
  import Card from "./Card.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { colors, variants, type CommonProps } from "./definitions.js";
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";

  const keys = Object.keys as <T>(o: T) => Array<keyof T>;

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "Card",
    component: Card,
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

<Story name="Default">
  {#snippet template(args: CommonProps)}
    <Card {...args} class="_stack-2">
      <h2>Card sample</h2>
      <p>Card content</p>
      <p>
        <Button>Button</Button>
      </p>
    </Card>
  {/snippet}
</Story>

<Story name="New event">
  {#snippet template(args: CommonProps)}
    <Card {...args} class="_stack-2">
      {#snippet header()}
        Create new event
      {/snippet}
      <p><label>Event <Input type="text" /></label></p>
      <p><label>Date <Input type="date" /></label></p>
      <p>
        <Button color="success" variant="solid">Save</Button>
        <Button color="danger" variant="ghost">Cancel</Button>
      </p>
    </Card>
  {/snippet}
</Story>
