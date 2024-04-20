<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { CommonProps } from "./definitions.js";

  const {
    children,
    color,
    variant,
    ...props
  }: CommonProps & SvelteHTMLElements["button"] = $props();

  const cls = $derived(
    [color, variant]
      .filter(Boolean)
      .map((v) => "-" + v)
      .join(" "),
  );
</script>

<button class={cls} {...props}>
  {@render children?.()}
</button>

<style lang="scss">
  button {
    color: var(--color);
    background: var(--background);
    border: 1px solid var(--border);
    padding: 0.5em 1em;
    border-radius: 0.25em;
  }
</style>
