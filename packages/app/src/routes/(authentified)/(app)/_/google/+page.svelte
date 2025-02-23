<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button, Card, Select } from "uistiti";

  const { data } = $props();
</script>

<Card color="danger" variant="solid">
  <p>Don't use this feature yet, it'll make your data public.</p>
</Card>

{#if data.me.tags.length === 0}
  <Card color="danger" variant="solid">
    <p>
      You need to create a tag first.
      <a href="tags">Create a tag</a>
    </p>
  </Card>
{/if}

<ul>
  {#each data.calendars as { id, summary, description }}
    {@const sync = data.syncMap.get(id!)}
    <li>
      <a href="?id={encodeURIComponent(id!)}">
        <strong>{summary}</strong>
        {description}
      </a>
      {#if sync}
        <span>
          (synced: {sync.direction} to {sync.tag.name})
        </span>
      {:else}
        <span>(not synced)</span>
      {/if}
      <form
        action="?/sync"
        method="POST"
        use:enhance={() =>
          ({ update }) =>
            update({ reset: false })}
      >
        <input type="hidden" name="googleCalendarId" value={id} />
        Direction:
        <Select name="direction" value={sync?.direction ?? "Both"} required>
          <option value="Both">Both</option>
          <option value="Pull">Pull</option>
          <option value="Push">Push</option>
        </Select>
        to
        <Select name="tagId" value={sync?.tag?.id} required>
          {#each data.me.tags as tag}
            <option value={tag.id}>{tag.name}</option>
          {/each}
        </Select>
        <Button color="success" variant="outline">
          {sync ? "Update" : "Save"}
        </Button>
      </form>
      {#if sync}
        <form action="?/unsync" method="POST" use:enhance>
          <input type="hidden" name="googleCalendarId" value={id} />
          <Button color="danger" variant="outline">Unsync</Button>
        </form>
      {/if}
    </li>
  {/each}
</ul>
