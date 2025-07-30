<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { CommonProps } from "./definitions.js";

  const {
    children,
    color,
    variant = "solid",
    square = false,
    ...props
  }: CommonProps &
    SvelteHTMLElements["button"] & { square?: boolean } = $props();
</script>

<button class:square data-color={color} data-variant={variant} {...props}>
  {@render children?.()}
</button>

<style lang="scss">
  button {
    padding: calc(7em / 16) calc(15em / 16);
    font-size: 1em;
    color: var(--ui-color);
    outline: 0.125em solid transparent;
    outline-offset: 0.125em;
    border: calc(1em / 16) solid var(--ui-border);
    border-radius: 0.25em;
    transition:
      100ms background-color,
      100ms box-shadow,
      100ms outline-color,
      100ms border-color;

    &.square {
      padding: calc(7em / 16);
    }

    &:enabled {
      background-color: var(--ui-background);
      box-shadow: inset 0 0 0 var(--ui-border-active);

      &:hover {
        color: var(--ui-color-interaction);
        background-color: var(--ui-background-hover);
        border-color: var(--ui-border-hover);
      }

      &:focus-visible {
        color: var(--ui-color-interaction);
        outline-color: var(--ui-border-hover);
        background-color: var(--ui-background-hover);
        border-color: var(--ui-border-hover);
      }

      &:active {
        color: var(--ui-color-interaction);
        background-color: var(--ui-background-active);
        border-color: var(--ui-border-active);
        box-shadow: inset 0 0.125em 0 var(--ui-border-active);
      }
    }
  }
</style>
