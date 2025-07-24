<script lang="ts">
  import { page } from "$app/state";

  const leaf = $derived(page.url.pathname.split("/").at(2) ?? "settings");
  const leaves: Record<string, string> = {
    settings: "Settings",
    habits: "Habit tracker",
    journal: "Journal",
    tags: "Tags",
    google: "Google calendars",
  };

  const { children } = $props();
</script>

<main
  style="margin-inline: auto; padding: 1rem; max-width: 40rem"
  class="_stack-4"
>
  <nav>
    <a href="/" class="_row-1"><span class="i-ph-caret-left"></span> Home</a>
    {#each Object.entries(leaves) as [key, title] (key)}
      <a
        href={key === "settings" ? "/_" : `/_/${key}`}
        aria-current={key === leaf ? "page" : undefined}
      >
        {title}
      </a>
    {/each}
  </nav>
  <h1 style="font-size: 4em">{leaves[leaf]}</h1>

  {@render children()}
</main>

<style>
  nav {
    display: flex;
    gap: 1rem;
  }

  [aria-current] {
    font-weight: bold;
  }
</style>
