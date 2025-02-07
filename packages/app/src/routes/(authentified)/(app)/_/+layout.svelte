<script lang="ts">
  import { page } from "$app/state";
  import CaretLeft from "~icons/ph/caret-left";

  const leaf = $derived(page.url.pathname.split("/").at(2) ?? "settings");

  const title = $derived(
    {
      settings: "Settings",
      habits: "Habit tracker",
      journal: "Journal",
      tags: "Tags",
    }[leaf],
  );

  const { children } = $props();
</script>

<main
  style="margin-inline: auto; padding: 1rem; max-width: 40rem"
  class="_stack-4"
>
  <nav>
    <a href="/" class="_row-1"><CaretLeft aria-hidden /> Home</a>
    <a href="/_" aria-current={leaf === "settings" ? "page" : undefined}
      >Settings</a
    >
    <a href="/_/habits" aria-current={leaf === "habits" ? "page" : undefined}
      >Habit tracker</a
    >
    <a href="/_/journal" aria-current={leaf === "journal" ? "page" : undefined}
      >Journal</a
    >
    <a href="/_/tags" aria-current={leaf === "tags" ? "page" : undefined}
      >Tags</a
    >
  </nav>
  <h1 style="font-size: 4em">{title}</h1>

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
