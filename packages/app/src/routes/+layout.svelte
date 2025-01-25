<script lang="ts">
  import { setLocale } from "messages/runtime";
  import "modern-normalize/modern-normalize.css";
  import "uistiti/global.css";
  import "uistiti/reset.css";
  import "uistiti/utils.css";
  import "../app.scss";

  const { children, data } = $props();

  // Setting the locale must be done in the same tick as the render to
  // prevent server-side race conditions
  setLocale(data.locale);
</script>

<svelte:head>
  <title>Timeline</title>
</svelte:head>

{@render children()}
