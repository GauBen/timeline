<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { CommonProps } from "./definitions.js";

  const {
    children,
    color,
    variant,
    ...props
  }: CommonProps & SvelteHTMLElements["div"] = $props();
  const cls = $derived(
    [color, variant]
      .filter(Boolean)
      .map((v) => "-" + v)
      .join(" "),
  );
</script>

<div class={cls} {...props}>
  {@render children?.()}
</div>

<style lang="scss">
  div {
    color: var(--color);
    background: var(--background);
    border: 1px solid var(--border);
    margin-block: 1rem;
    padding: 1em;
    border-radius: 0.25em;
  }
</style>
