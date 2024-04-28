<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { resolveRoute } from "$app/paths";
  import { page } from "$app/stores";
  import Layout from "$lib/Layout.svelte";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button } from "uistiti";
  import Back from "~icons/ph/caret-left";
  import Month from "./Month.svelte";
  import Week from "./Week.svelte";
  import Year from "./Year.svelte";

  const { data } = $props();
  const { latest, followed, start, windows, user, view } = $derived(data);

  let eventInCreation = $state<Temporal.PlainDateTime>();
</script>

<svelte:window
  onkeydown={({ key }) => {
    if (!eventInCreation) return;

    if (key === "Escape") eventInCreation = undefined;
    else if (key === "ArrowDown")
      eventInCreation = eventInCreation.add({ minutes: 15 });
    else if (key === "ArrowUp")
      eventInCreation = eventInCreation.subtract({ minutes: 15 });
    else if (key === "ArrowLeft")
      eventInCreation = eventInCreation.subtract({ days: 1 });
    else if (key === "ArrowRight")
      eventInCreation = eventInCreation.add({ days: 1 });
  }}
/>

{#if eventInCreation}
  <dialog open>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <form
      use:enhance
      method="POST"
      action="?/createEvent"
      onreset={() => {
        eventInCreation = undefined;
      }}
      onkeydown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") event.currentTarget.reset();
      }}
    >
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
            value={eventInCreation.toString().slice(0, 16)}
            oninput={({ currentTarget }) => {
              try {
                eventInCreation = Temporal.PlainDateTime.from(
                  currentTarget.value,
                );
              } catch {
                // Ignore invalid dates
              }
            }}
          />
        </label>
      </p>
      <p>
        Visibility:
        <label>
          <input type="radio" name="public" value="1" checked /> Public
        </label>
        <label>
          <input type="radio" name="public" value="" /> Private
        </label>
      </p>
      <p>
        <Button type="submit" color="success">Create</Button>
        <Button type="reset" color="danger" variant="outline">Cancel</Button>
      </p>
    </form>
  </dialog>
{/if}

<Layout {latest}>
  {#snippet header()}
    {#if user}
      <form method="POST" class="_row-2" use:enhance>
        <h1>
          <a href="/" style="text-decoration: unset"><Back /></a>
          <span
            style="display: inline-block; width: 2rem; height: 2rem; background: purple; border-radius: 1rem"
          ></span>
          {user.displayName}
        </h1>
        {#if followed}
          <Button color="danger" formaction="?/unfollow">Unfollow</Button>
        {:else}
          <Button formaction="?/follow">Follow</Button>
        {/if}
      </form>
    {:else}
      <h1><a href="/" style="text-decoration: unset">Timeline</a></h1>
    {/if}
    <select
      onchange={({ currentTarget }) =>
        goto(
          resolveRoute($page.route.id!, {
            ...$page.params,
            date: start.slice(
              0,
              currentTarget.value === "day"
                ? 10
                : currentTarget.value === "month"
                  ? 7
                  : 4,
            ),
          }) + $page.url.hash,
          { keepFocus: true },
        )}
      value={view}
    >
      <option value="day">Day</option>
      <option value="month">Month</option>
      <option value="year">Year</option>
    </select>

    <a href="/settings">Settings</a>
  {/snippet}

  {#if view === "day"}
    <Week {start} {windows} bind:eventInCreation></Week>
  {:else if view === "month"}
    <Month start={Temporal.PlainDate.from(start)} {windows}></Month>
  {:else}
    <Year start={Temporal.PlainDate.from(start)} {windows}></Year>
  {/if}
</Layout>

<style lang="scss">
  dialog {
    z-index: 100;
  }
</style>
