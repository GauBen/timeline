<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import Pencil from "~icons/ph/pencil-duotone";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button, Input } from "uistiti";
  import { reportValidity } from "formgator/sveltekit";
  import { enhance } from "$app/forms";

  const { data } = $props();

  let edit = $state<string>();
</script>

<main class="_stack-4">
  <h1>Journal</h1>

  {#each data.entries as { date, body }}
    {@const day = date.toISOString().slice(0, 10)}
    <article id="journal-{day}">
      <h2 class="_row-2">
        {i18n.formatDay(Temporal.PlainDate.from(day))}
      </h2>

      {#if day === edit}
        <form
          method="POST"
          use:enhance={() => reportValidity({ reset: false })}
        >
          <input type="hidden" name="date" value={day} />
          <textarea name="body" cols="50" rows="8" value={body ?? ""}
          ></textarea>
          <Button color="success">Save</Button>
          <Button
            type="button"
            variant="outline"
            onclick={() => (edit = undefined)}>Cancel</Button
          >
        </form>
      {:else}
        <p>
          {body}
          <Button
            square
            variant="ghost"
            onclick={() => (edit = day)}
            title="Edit"
            style="font-size: 1rem"
          >
            <Pencil />
          </Button>
        </p>
      {/if}
    </article>
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
</main>
