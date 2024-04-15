<script lang="ts">
  import { enhance } from "$app/forms";
  import { m } from "$lib/i18n.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button } from "uistiti";
  import "uistiti/global.css";

  export let data;

  export let form;

  $: ({ user, events } = data);
</script>

<h1>
  {m.latest_events()}
</h1>

{#if user}
  <h2>from {user.displayName}</h2>
{/if}

<ul>
  {#each events as { author, body }}
    <li>
      {body}
      (<a href="/@{author.username}">@{author.username}</a>)
    </li>
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
      <input
        required
        type="datetime-local"
        name="date"
        value={Temporal.Now.zonedDateTime("iso8601", "Europe/Paris")
          .toString()
          .slice(0, 16)}
      />
    </label>
  </p>
  <p>Visibility: Public (everyone can see it)</p>
  <p>
    <Button type="submit" color="success">Create</Button>
  </p>
</form>
