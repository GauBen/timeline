<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { resolveRoute } from "$lib/paths.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button } from "uistiti";
  import Back from "~icons/ph/caret-left";
  import Dialog from "./Dialog.svelte";
  import EventActions from "./EventActions.svelte";
  import Layout from "./Layout.svelte";
  import Month from "./Month.svelte";
  import Week from "./Week.svelte";
  import Year from "./Year.svelte";

  const { data } = $props();
  const { event, latest, followed, windows, user, view, followings, me } =
    $derived(data);
  const start = $derived(Temporal.PlainDate.from(data.start));

  let component = $state<Month | Week | Year>();

  /** Opens or closes the event creation dialog at a given datetime. */
  const toggleEventCreation = async (
    datetime?: Temporal.PlainDateTime | undefined,
  ) => {
    await goto(
      $resolveRoute(
        {},
        {
          search: datetime
            ? "?" + new URLSearchParams({ new: datetime.toString() })
            : "",
        },
      ),
      { keepFocus: true, noScroll: true },
    );
  };
  const eventInCreation = $derived(
    data.eventInCreation
      ? Temporal.PlainDateTime.from(data.eventInCreation)
      : undefined,
  );
</script>

<svelte:window
  onkeydown={async ({ key }) => {
    if (!eventInCreation) return;
    let to: Temporal.PlainDateTime | undefined;

    if (key === "Escape")
      await goto($page.url.pathname, { keepFocus: true, noScroll: true });
    else if (key === "ArrowDown") to = eventInCreation.add({ minutes: 15 });
    else if (key === "ArrowUp") to = eventInCreation.subtract({ minutes: 15 });
    else if (key === "ArrowLeft") to = eventInCreation.subtract({ days: 1 });
    else if (key === "ArrowRight") to = eventInCreation.add({ days: 1 });

    if (to) await toggleEventCreation(to);
  }}
/>

{#if event}
  <dialog open style="z-index: 1">
    <h1>{event.author.displayName}</h1>
    <p>{event.body}</p>
    <time datetime={event.date.toISOString()}>
      {event.date.toLocaleString()}
    </time>
    <form method="POST" use:enhance>
      <EventActions {event} {me} />
    </form>
    <a href={$page.url.pathname}>Close</a>
  </dialog>
{:else if eventInCreation}
  <Dialog
    {followings}
    {eventInCreation}
    {toggleEventCreation}
    getEventInCreationElement={component?.getEventInCreationElement}
  />
{/if}

<Layout {me} {latest}>
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

    <a href="/settings">{me.displayName}</a>
  {/snippet}

  <svelte:component
    this={{ day: Week, month: Month, year: Year }[view]}
    {start}
    {windows}
    {eventInCreation}
    onevent={async (to) => toggleEventCreation(to)}
    bind:this={component}
  />
</Layout>
