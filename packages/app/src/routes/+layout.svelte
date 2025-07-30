<script lang="ts">
  import { setLocale } from "messages/runtime";
  import "uistiti/css";
  import "../app.scss";
  import "virtual:uno.css";

  const { children, data } = $props();

  // Setting the locale must be done in the same tick as the render to
  // prevent server-side race conditions
  setLocale(data.locale);
</script>

<svelte:head>
  <title>Timeline</title>
</svelte:head>

{@render children()}
