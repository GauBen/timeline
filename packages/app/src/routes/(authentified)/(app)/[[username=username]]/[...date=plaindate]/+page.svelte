<script module lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { reportValidity } from "formgator/sveltekit";
  import { Button, Select } from "uistiti";
  import Calendar from "~icons/ph/calendar-dot-duotone";
  import Back from "~icons/ph/caret-left";
  import Globe from "~icons/ph/globe-duotone";
  import type { PageData } from "./$types.js";
  import Dialog from "./Dialog.svelte";
  import EventActions from "./EventActions.svelte";
  import Layout from "./Layout.svelte";
  import Month from "./Month.svelte";
  import Week from "./Week.svelte";
  import Year from "./Year.svelte";

  /** Opens or closes the event creation dialog at a given datetime. */
  const toggleEventCreation = async (
    datetime?: Temporal.PlainDateTime | undefined,
  ) => {
    await goto(
      paths.resolveRoute(
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

  export interface ViewProps {
    start: PageData["start"];
    timezone: PageData["me"]["timezone"];
    events: PageData["events"];
    eventInCreation: PageData["eventInCreation"];
    onevent: typeof toggleEventCreation;
  }
</script>

<script lang="ts">
  const { data } = $props();
  const {
    event,
    events,
    eventInCreation,
    followed,
    followings,
    journal,
    latest,
    me,
    start,
    tags,
    user,
    view,
  } = $derived(data);

  const View = $derived({ Week, Month, Year }[view]);
  let component = $state<Week | Month | Year>();
  const getEventInCreationElement = () =>
    component?.getEventInCreationElement();

  const viewProps: ViewProps = $derived({
    start,
    events,
    timezone: me.timezone,
    eventInCreation,
    onevent: toggleEventCreation,
  });
</script>

<svelte:window
  onkeydown={async ({ key }) => {
    if (eventInCreation) {
      let to: Temporal.PlainDateTime | undefined;

      if (key === "Escape")
        await goto(page.url.pathname, { keepFocus: true, noScroll: true });
      else if (key === "ArrowDown") to = eventInCreation.add({ minutes: 15 });
      else if (key === "ArrowUp")
        to = eventInCreation.subtract({ minutes: 15 });
      else if (key === "ArrowLeft") to = eventInCreation.subtract({ days: 1 });
      else if (key === "ArrowRight") to = eventInCreation.add({ days: 1 });

      if (to) await toggleEventCreation(to);
    } else {
      if (key === "ArrowLeft") {
        await goto(
          paths.resolveRoute({ date: start.subtract({ days: 1 }).toString() }),
          { keepFocus: true },
        );
      } else if (key === "ArrowRight") {
        await goto(
          paths.resolveRoute({ date: start.add({ days: 1 }).toString() }),
          {
            keepFocus: true,
          },
        );
      }
    }
  }}
/>

{#if event}
  <dialog open style="z-index: 1">
    <a href={page.url.pathname}>Close</a>
    <header>
      <h3>
        <a href={paths.resolveRoute({ username: event.author.username })}>
          @{event.author.username}
        </a>
      </h3>
      <p style="font-size: .75em">
        {#if event.public}
          <Globe />
        {/if}
        <a href="?event={event.id}">{i18n.format(event.createdAt)}</a>
      </p>
      <p>
        Tags:
        {#each event.event.tags as tag}
          {tag.name},
        {/each}
      </p>
    </header>
    <p>{event.body}</p>
    <footer>
      <Calendar />
      {i18n.format(event.date)}
      <form method="POST" use:enhance>
        <EventActions {event} {me} />
      </form>
    </footer>
  </dialog>
{:else if eventInCreation}
  <Dialog
    {tags}
    {followings}
    {eventInCreation}
    {toggleEventCreation}
    timezone={me.timezone}
    {getEventInCreationElement}
  />
{:else if page.url.searchParams.has("/journal")}
  {@const date = page.url.searchParams.get("/journal")!}
  <dialog open style="z-index: 100">
    <form
      action="?/journal={date}"
      method="POST"
      use:enhance={() => reportValidity({ reset: false })}
    >
      <h3>
        Journal: {i18n.formatDay(Temporal.PlainDate.from(date))}
        <a href={paths.resolveRoute(page.params, { search: "" })}>Close</a>
      </h3>
      <input type="hidden" name="date" value={date} />
      <textarea name="body" cols="50" rows="8" value={journal?.body ?? ""}
      ></textarea>
      <Button color="success">Save</Button>
    </form>
  </dialog>
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
    <Select
      onchange={({ currentTarget }) =>
        goto(
          paths.resolveRoute({
            date: (eventInCreation ?? start)
              .toString()
              .slice(0, { Week: 10, Month: 7, Year: 4 }[currentTarget.value]),
          }),
          { keepFocus: true },
        )}
      value={view}
    >
      <option value="Week">Week</option>
      <option value="Month">Month</option>
      <option value="Year">Year</option>
    </Select>

    <a href="/_">{me.displayName}</a>
  {/snippet}

  <View {...viewProps} bind:this={component} />
</Layout>

<style lang="scss">
  dialog {
    min-width: 20rem;
  }
</style>
