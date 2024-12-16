<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { CommonProps } from "./definitions.js";
  import type { Snippet } from "svelte";

  const {
    children,
    header,
    footer,
    color,
    variant = "outline",
    ...props
  }: CommonProps &
    SvelteHTMLElements["section"] & {
      header?: Snippet;
      footer?: Snippet;
    } = $props();
</script>

<section data-color={color} data-variant={variant} {...props}>
  {#if header}
    <header>
      {@render header()}
    </header>
  {/if}
  <div>
    {@render children?.()}
  </div>
  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</section>

<style lang="scss">
  section {
    color: var(--ui-color);
    background: var(--ui-background);
    border: 1px solid var(--ui-border);
    margin-block: 1rem;
    border-radius: 0.25em;
  }

  header {
    border-bottom: 1px solid var(--ui-border);
  }

  div {
    padding-inline: 1rem;
  }

  footer {
    border-top: 1px solid var(--ui-border);
  }
</style>
