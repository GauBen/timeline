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

  // https://github.com/sveltejs/svelte/issues/14815
  if (props.multiple) value ??= [];
  $effect(() => {
    if (props.multiple) value ??= [];
  });
</script>

<select bind:value data-color={color} data-variant={variant} {...props}>
  {@render children?.()}
</select>

<style lang="scss">
  select {
    font-size: 1em;
    padding: calc(7em / 16);
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
      box-shadow: inset 0 0 0 var(--ui-border-hover);

      &:hover {
        box-shadow: inset 0 -0.125em 0 var(--ui-border-hover);
        border-color: var(--ui-border-hover);
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
