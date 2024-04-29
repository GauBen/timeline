<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import Layout from "$lib/Layout.svelte";
  import { resolveRoute } from "$lib/paths.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button } from "uistiti";
  import Back from "~icons/ph/caret-left";
  import Dialog from "./Dialog.svelte";
  import Month from "./Month.svelte";
  import Week from "./Week.svelte";
  import Year from "./Year.svelte";

  const { data } = $props();
  const { latest, followed, windows, user, view } = $derived(data);
  const start = $derived(Temporal.PlainDate.from(data.start));

  let eventInCreation = $state<Temporal.PlainDateTime>();

  let component = $state<Month | Week | Year>();
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
  <Dialog
    bind:eventInCreation
    onreset={() => {
      eventInCreation = undefined;
    }}
    getEventInCreationElement={component!.getEventInCreationElement}
  />
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
          $resolveRoute({
            date: start
              .toString()
              .slice(0, { day: 10, month: 7, year: 4 }[currentTarget.value]),
          }),
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

  <svelte:component
    this={{ day: Week, month: Month, year: Year }[view]}
    {start}
    {windows}
    bind:eventInCreation
    bind:this={component}
  />
</Layout>
