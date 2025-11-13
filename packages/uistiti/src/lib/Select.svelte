<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import type { CommonProps } from "./definitions.js";

  let {
    children,
    color,
    variant = "outline",
    value = $bindable(),
    ...props
  }: CommonProps & SvelteHTMLElements["select"] = $props();
</script>

<select bind:value data-color={color} data-variant={variant} {...props}>
  {@render children?.()}
</select>

<style lang="scss">
  select {
    padding: calc(7em / 16);
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

    &:enabled {
      background-color: var(--ui-background);
      box-shadow: inset 0 0 0 var(--ui-border-hover);

      &:hover {
        border-color: var(--ui-border-hover);
        box-shadow: inset 0 calc(-1em / 16) 0 var(--ui-border-hover);
      }

      &:focus-visible {
        outline-color: var(--ui-background-strong);
        border-color: var(--ui-border-hover);
      }

      &:active {
        border-color: var(--ui-border-active);
        box-shadow: inset 0 0 0 var(--ui-border-hover);
      }
    }
  }
</style>
