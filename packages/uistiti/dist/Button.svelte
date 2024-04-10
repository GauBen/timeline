<script lang="ts">const { color, variant, ...props } = $props();
const cls = $derived(
  [color, variant].filter(Boolean).map((v) => "-" + v).join(" ")
);
</script>

<button class={cls} {...props}>
  <slot />
</button>

<style>button {
  color: var(--color);
  background: var(--background);
  border: 1px solid var(--border);
  padding: 0.5em 1em;
  border-radius: 0.25em;
}</style>
