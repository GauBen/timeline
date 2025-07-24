<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button, Card, Input } from "uistiti";
  import { reportValidity } from "formgator/sveltekit";
  import { enhance } from "$app/forms";

  const { data } = $props();

  let edit = $state<string>();
</script>

<p class="_row-2">
  <a href="/_/journal" aria-current={data.tag === undefined ? "page" : null}>
    All ({data.count})
  </a>
  {#each data.tags as { tag, _count } (tag)}
    <a href="?tag={tag}" aria-current={data.tag === tag ? "page" : null}>
      {tag} ({_count.tag})
    </a>
  {/each}
</p>

{#each data.entries as { date, body, html } (date.toISOString())}
  {@const day = date.toISOString().slice(0, 10)}
  <Card id="journal-{day}">
    <!-- <h2 class="_row-2"> -->
    {#snippet header()}
      <a href="#journal-{day}" style="text-decoration: inherit">
        {i18n.formatDay(Temporal.PlainDate.from(day))}
      </a>
      <span style="flex:1"></span>

      {#if day === edit}
        <Button
          square
          variant="ghost"
          onclick={() => (edit = undefined)}
          title="Edit"
          style="font-size: 1rem"
        >
          <span class="i-ph-pencil-duotone">Close</span>
        </Button>
      {:else}
        <Button
          square
          variant="ghost"
          onclick={() => (edit = day)}
          title="Edit"
          style="font-size: 1rem"
        >
          <span class="i-ph-pencil-duotone">Edit</span>
        </Button>
      {/if}
    {/snippet}

    {#if day === edit}
      <form method="POST" use:enhance={() => reportValidity({ reset: false })}>
        <input type="hidden" name="date" value={day} />
        <!-- svelte-ignore a11y_autofocus -->
        <textarea
          name="body"
          cols="50"
          rows="8"
          value={body ?? ""}
          autofocus
          onkeydown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form!.requestSubmit();
            } else if (event.key === "Escape") {
              edit = undefined;
            }
          }}
        ></textarea>
        <Button color="success">Save</Button>
      </form>
    {:else}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html html}
    {/if}
  </Card>
{/each}

<details>
  <summary>New entry</summary>
  <form method="POST" use:enhance={() => reportValidity()}>
    <p>
      <Input type="date" name="date" required />
    </p>
    <p>
      <textarea name="body" cols="50" rows="8" required></textarea>
    </p>
    <p>
      <Button type="submit">Add</Button>
    </p>
  </form>
</details>

<style>
  [aria-current="page"] {
    font-weight: bold;
  }
</style>
