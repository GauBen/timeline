<script lang="ts">
  import { enhance } from "$app/forms";
  import { m } from "$lib/i18n.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button, Card } from "uistiti";
  import "uistiti/global.css";

  export let data;

  export let form;

  const formatter = new Intl.RelativeTimeFormat(data.language, {
    numeric: "auto",
  });
  const thresholds = {
    seconds: 60,
    minutes: 60,
    hours: 24,
    days: 30.4375,
    months: 12,
  };
  const format = (date: Date) => {
    let diff = (date.getTime() - Date.now()) / 1000;
    for (const [unit, threshold] of Object.entries(thresholds)) {
      if (Math.abs(diff) < threshold) {
        return formatter.format(
          Math.round(diff),
          unit as Intl.RelativeTimeFormatUnit,
        );
      }
      diff /= threshold;
    }
    return formatter.format(Math.round(diff), "years");
  };

  $: ({ user, events, followed } = data);
</script>

<h1>
  {m.latest_events()}
</h1>

{#if user}
  <h2>from {user.displayName}</h2>
  {#if followed}
    <form method="POST" action="?/unfollow" use:enhance>
      <Button color="danger">Unfollow</Button>
    </form>
  {:else}
    <form method="POST" action="?/follow" use:enhance>
      <Button>Follow</Button>
    </form>
  {/if}
{/if}

<ul>
  {#each events as { author, body, date }}
    <li>
      <Card>
        {body}<br />
        (<a href="/@{author.username}">@{author.username}</a>)<br />
        {format(date)}
      </Card>
    </li>
  {/each}
</ul>

{#if form?.body}
  <p>
    Created {form.body}
  </p>
{/if}

<form method="POST" action="?/createEvent" use:enhance>
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
