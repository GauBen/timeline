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
  {#snippet children(args: CommonProps)}
    <Card {...args} class="_stack-2">
      <h2>Card sample</h2>
      <p>Card content</p>
      <Button>Button</Button>
    </Card>
  {/snippet}
</Story>

<Story name="New event">
  {#snippet children(args: CommonProps)}
    <Card {...args} class="_stack-2">
      {#snippet header()}
        Create new event
      {/snippet}
      <p><label>Event <Input type="text" /></label></p>
      <p><label>Date <Input type="date" /></label></p>
      <p>
        <Button color="success">Save</Button>
        <Button color="danger" variant="outline">Cancel</Button>
      </p>
    </Card>
  {/snippet}
</Story>

<style global>
  :global ._stack-2 {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  :global ._stack-4 {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
