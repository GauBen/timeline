<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button } from "uistiti";
  import "uistiti/global.css";

  export let data;

  export let form;

  $: ({ events } = data);
</script>

<h1>Events</h1>

<ul>
  {#each events as event}
    <li>{event.body} (@{event.author.username})</li>
  {/each}
</ul>

{#if form?.body}
  <p>
    Created {form.body}
  </p>
{/if}

<form method="POST" action="" use:enhance>
  <h2>Create a new event</h2>
  <p>
    <label>
      <span>Event</span>
      <input required type="text" maxlength="1024" name="body" />
    </label>
  </p>
  <p>
    <label>
      <span>Date</span>
      <input required type="datetime-local" name="date" />
    </label>
  </p>
  <p>
    <Button type="submit" color="success">Create</Button>
  </p>
</form>

<a href="/auth/logout">Logout</a>
