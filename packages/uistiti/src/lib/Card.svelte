<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { CommonProps } from "./definitions.js";

  const {
    children,
    color,
    variant = "outline",
    ...props
  }: CommonProps & SvelteHTMLElements["div"] = $props();
</script>

<div data-color={color} data-variant={variant} {...props}>
  {@render children?.()}
</div>

<style lang="scss">
  div {
    color: var(--ui-color);
    background: var(--ui-background);
    border: 1px solid var(--ui-border);
    margin-block: 1rem;
    padding: 1em;
    border-radius: 0.25em;
  }
</style>
