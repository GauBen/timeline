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
    font-size: 1em;
    padding: calc(7em / 16) calc(15em / 16);
    border-radius: 0.25em;
    border: calc(1em / 16) solid var(--border);
    outline: 0.125em solid transparent;
    outline-offset: 0.125em;
    color: var(--color);
    transition:
      100ms background-color,
      100ms box-shadow,
      100ms outline-color,
      100ms border-color;

    &:enabled {
      background-color: var(--background);
      box-shadow: inset 0 0 0 var(--border-active);
      text-shadow: 0 0 0.125rem var(--color-opposite);

      &:hover {
        color: var(--color-interaction);
        text-shadow: 0 0 0.125rem var(--color-interaction-opposite);
        background-color: var(--background-hover);
        border-color: var(--border-hover);
      }

      &:focus-visible {
        color: var(--color-interaction);
        text-shadow: 0 0 0.125rem var(--color-interaction-opposite);
        background-color: var(--background-hover);
        border-color: var(--border-hover);
        outline-color: var(--border-hover);
      }

      &:active {
        color: var(--color-interaction);
        text-shadow: 0 0 0.125rem var(--color-interaction-opposite);
        background-color: var(--background-active);
        border-color: var(--border-active);
        box-shadow: inset 0 0.125em 0 var(--border-active);
      }
    }
  }
</style>
