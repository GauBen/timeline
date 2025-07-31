<script lang="ts">
  import { page } from "$app/state";
  import { m } from "messages";

  const leaf = $derived(page.url.pathname.split("/").at(2) ?? "settings");
  const leaves: Record<string, string> = {
    settings: m.cozy_moving_zebra_approve(),
    habits: m.key_misty_sloth_assure(),
    journal: m.solid_ok_javelina_leap(),
    tags: m.teal_inclusive_capybara_treat(),
    google: m.bold_mean_husky_devour(),
  };

  const { children } = $props();
</script>

<main
  style="max-width: 40rem; padding: 1rem;margin-inline: auto"
  class="_stack-4"
>
  <nav>
    <a href="/" class="_row-1"
      ><span class="i-ph-caret-left"></span> {m.seemly_fun_porpoise_wish()}</a
    >
    {#each Object.entries(leaves) as [key, title] (key)}
      <a
        href={key === "settings" ? "/_" : `/_/${key}`}
        aria-current={key === leaf ? "page" : undefined}
      >
        {title}
      </a>
    {/each}
  </nav>
  <h1 style="font-size: 3em">{leaves[leaf]}</h1>

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
