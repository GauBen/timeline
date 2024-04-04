<script lang="ts">
  import { languageTag } from "$paraglide/runtime.js";
  import { Temporal } from "@js-temporal/polyfill";
  const { children } = $props();

  const today = Temporal.Now.plainDateISO();
  const yesterday = today.subtract({ days: 1 });
  const tomorrow = today.add({ days: 1 });

  console.log(languageTag());
</script>

<nav>
  <a href="/">Latest</a>
  <a href="/{yesterday.toString().replaceAll('-', '/')}"> Yesterday </a>
  <a href="/{today.toString().replaceAll('-', '/')}"> Today </a>
  <a href="/{today.toString().replaceAll('-', '/').slice(0, 7)}"> Month </a>
  <a href="/{tomorrow.toString().replaceAll('-', '/')}"> Tomorrow </a>
  <a href="/auth/logout" data-sveltekit-reload>Logout</a>
  <select
    on:change={function () {
      document.cookie = `language=${this.value}; path=/; max-age=31536000`;
      location.reload();
    }}
  >
    <option value="en-US">English</option>
    <option value="fr-FR">Français</option>
  </select>
</nav>

{@render children()}
