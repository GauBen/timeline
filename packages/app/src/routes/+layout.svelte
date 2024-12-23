<script lang="ts">
  import { setLanguageTag } from "$paraglide/runtime.js";
  import "modern-normalize/modern-normalize.css";
  import "uistiti/global.css";
  import "uistiti/reset.css";
  import "../app.scss";

  const { children, data } = $props();

  // Setting the language tag must be done in the same tick as the render to
  // prevent server-side race conditions
  setLanguageTag(data.language);
</script>

<svelte:head>
  <title>Timeline</title>
</svelte:head>

{@render children()}
