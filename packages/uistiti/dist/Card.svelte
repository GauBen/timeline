<script lang="ts">const { color, variant, ...props } = $props();
const cls = $derived(
  [color, variant].filter(Boolean).map((v) => "-" + v).join(" ")
);
</script>

<div class={cls} {...props}>
  <slot />
</div>

<style>div {
  color: var(--color);
  background: var(--background);
  border: 1px solid var(--border);
  margin-block: 1rem;
  padding: 1em;
  border-radius: 0.25em;
}</style>
