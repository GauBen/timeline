<script lang="ts">
  const { data } = $props();
</script>

<h1>Google calendars</h1>
<ul>
  {#each data.calendars as { id, summary, description }}
    <li>
      <a href="?id={encodeURIComponent(id)}">
        <strong>{summary}</strong>
        {description}
      </a>
    </li>
  {/each}
</ul>

{#if data.events}
  <h2>Next events</h2>
  <ul>
    {#each data.events as { summary, description, location, start, htmlLink }}
      <li>
        <a href={htmlLink}>
          <strong>{summary}</strong>
          {description}
          {location}
          {start?.dateTime ?? start?.date}
        </a>
      </li>
    {/each}
  </ul>
{/if}
