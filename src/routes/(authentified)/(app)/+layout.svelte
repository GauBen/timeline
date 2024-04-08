<script lang="ts">
  import { Temporal } from "@js-temporal/polyfill";
  const { children, data } = $props();

  const today = Temporal.Now.plainDateISO();
</script>

<nav>
  <a href="/">Latest</a>
  <a href="/{today.toString().replaceAll('-', '/')}">Day</a>
  <a href="/{today.toString().replaceAll('-', '/').slice(0, 7)}">Month</a>
  <a href="/auth/logout" data-sveltekit-reload>Logout</a>
  <select
    value={data.language}
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
