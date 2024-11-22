<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { CommonProps } from "./definitions.js";

  const {
    children,
    color,
    variant,
    ...props
  }: CommonProps & SvelteHTMLElements["button"] = $props();
</script>

<button data-color={color} data-variant={variant} {...props}>
  {@render children?.()}
</button>

<style lang="scss">
  button {
    font-size: 1em;
    padding: calc(7em / 16) calc(15em / 16);
    border-radius: 0.25em;
    border: calc(1em / 16) solid var(--ui-border);
    outline: 0.125em solid transparent;
    outline-offset: 0.125em;
    color: var(--ui-color);
    transition:
      100ms background-color,
      100ms box-shadow,
      100ms outline-color,
      100ms border-color;

    &:enabled {
      background-color: var(--ui-background);
      box-shadow: inset 0 0 0 var(--ui-border-active);
      text-shadow: 0 0 0.125rem var(--ui-color-opposite);

      &:hover {
        color: var(--ui-color-interaction);
        text-shadow: 0 0 0.125rem var(--ui-color-interaction-opposite);
        background-color: var(--ui-background-hover);
        border-color: var(--ui-border-hover);
      }

      &:focus-visible {
        color: var(--ui-color-interaction);
        text-shadow: 0 0 0.125rem var(--ui-color-interaction-opposite);
        background-color: var(--ui-background-hover);
        border-color: var(--ui-border-hover);
        outline-color: var(--ui-border-hover);
      }

      &:active {
        color: var(--ui-color-interaction);
        text-shadow: 0 0 0.125rem var(--ui-color-interaction-opposite);
        background-color: var(--ui-background-active);
        border-color: var(--ui-border-active);
        box-shadow: inset 0 0.125em 0 var(--ui-border-active);
      }
    }
  }
</style>
