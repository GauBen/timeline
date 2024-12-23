<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { CommonProps } from "./definitions.js";
  import type { Snippet } from "svelte";

  const {
    children,
    header,
    headerProps,
    color,
    variant = "outline",
    ...props
  }: CommonProps &
    SvelteHTMLElements["div"] & {
      header?: Snippet;
      headerProps?: SvelteHTMLElements["header"];
    } = $props();
</script>

<section data-color={color} data-variant={variant}>
  {#if header}
    <header {...headerProps}>
      {@render header()}
    </header>
  {/if}
  <div {...props}>
    {@render children?.()}
  </div>
</section>

<style lang="scss">
  section {
    color: var(--ui-color);
    background: var(--ui-background);
    border: 1px solid var(--ui-border);
    border-radius: 0.25em;
    contain: paint;
  }

  header {
    padding: 0.5rem;
    border-bottom: 1px solid var(--ui-border);
    font-weight: bold;
    background-color: var(--ui-background-strong);
    color: var(--ui-color-strong);
    font-size: 1.25em;
  }

  div {
    padding: 1rem;
  }
</style>
