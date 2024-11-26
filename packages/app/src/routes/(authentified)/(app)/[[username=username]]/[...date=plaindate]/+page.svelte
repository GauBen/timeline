<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { format } from "$lib/i18n.js";
  import { resolveRoute } from "$lib/paths.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button } from "uistiti";
  import Calendar from "~icons/ph/calendar-dot-duotone";
  import Back from "~icons/ph/caret-left";
  import Globe from "~icons/ph/globe-duotone";
  import Dialog from "./Dialog.svelte";
  import EventActions from "./EventActions.svelte";
  import Layout from "./Layout.svelte";
  import Month from "./Month.svelte";
  import Week from "./Week.svelte";
  import Year from "./Year.svelte";

  const { data } = $props();
  const {
    event,
    followed,
    followings,
    habits,
    latest,
    me,
    user,
    view,
    windows,
  } = $derived(data);
  const start = $derived(Temporal.PlainDate.from(data.start));

  const Component = $derived({ day: Week, month: Month, year: Year }[view]);
  let component = $state<Week | Month | Year>();

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
    data.eventInCreation && Temporal.PlainDateTime.from(data.eventInCreation),
  );
</script>

<svelte:window
  onkeydown={async ({ key }) => {
    if (eventInCreation) {
      let to: Temporal.PlainDateTime | undefined;

      if (key === "Escape")
        await goto($page.url.pathname, { keepFocus: true, noScroll: true });
      else if (key === "ArrowDown") to = eventInCreation.add({ minutes: 15 });
      else if (key === "ArrowUp")
        to = eventInCreation.subtract({ minutes: 15 });
      else if (key === "ArrowLeft") to = eventInCreation.subtract({ days: 1 });
      else if (key === "ArrowRight") to = eventInCreation.add({ days: 1 });

      if (to) await toggleEventCreation(to);
    } else {
      if (key === "ArrowLeft") {
        await goto(
          $resolveRoute({ date: start.subtract({ days: 1 }).toString() }),
          { keepFocus: true },
        );
      } else if (key === "ArrowRight") {
        await goto($resolveRoute({ date: start.add({ days: 1 }).toString() }), {
          keepFocus: true,
        });
      }
    }
  }}
/>

{#if event}
  <dialog open style="z-index: 1">
    <a href={$page.url.pathname}>Close</a>
    <header>
      <h3>
        <a href={$resolveRoute({ username: event.author.username })}>
          @{event.author.username}
        </a>
      </h3>
      <p style="font-size: .75em">
        {#if event.public}
          <Globe />
        {/if}
        <a href="?event={event.id}">{$format(event.createdAt)}</a>
      </p>
    </header>
    <p>{event.body}</p>
    <footer>
      <Calendar />
      {$format(event.date)}
      <form method="POST" use:enhance>
        <EventActions {event} {me} />
      </form>
    </footer>
  </dialog>
{:else if eventInCreation}
  <Dialog
    {followings}
    {eventInCreation}
    {toggleEventCreation}
    timezone={me.timezone}
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

  <Component
    {start}
    {habits}
    {windows}
    timezone={me.timezone}
    {eventInCreation}
    onevent={toggleEventCreation}
    bind:this={component}
  />
</Layout>

<style lang="scss">
  dialog {
    min-width: 20rem;
  }
</style>
