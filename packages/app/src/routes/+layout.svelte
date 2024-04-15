<script lang="ts">
  import { setLanguageTag } from "$paraglide/runtime.js";
  import "modern-normalize/modern-normalize.css";

  const { data } = $props();

  // Setting the language tag must be done in the same tick as the render to
  // prevent server-side race conditions
  setLanguageTag(data.language);
</script>

<svelte:head>
  <title>Timeline</title>
</svelte:head>

<slot />

<footer style="font-size: .8em; text-align: center">
  <p>
    ⚠️ Timeline is in not production ready. Please don't use it for anything
    important. ⚠️
  </p>
</footer>
