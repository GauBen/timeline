<script module lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import { reportValidity } from "formgator/sveltekit";
  import { Button, Select } from "uistiti";
  import type { PageData } from "./$types.js";
  import EventCreationDialog from "./EventCreationDialog.svelte";
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
            ? `?${new URLSearchParams({ new: datetime.toString() })}`
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
  import Dialog from "$lib/components/Dialog.svelte";
  import { Textarea } from "uistiti";
  import { m } from "messages";

  const { data, params } = $props();
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
    } else if (page.url.searchParams.has("/journal")) {
      if (key === "Escape") {
        await goto(paths.resolveRoute(params, { search: "" }), {
          keepFocus: true,
          noScroll: true,
        });
      }
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
  <Dialog open>
    {#snippet header()}
      <span style="flex: 1">Event details</span>
      <a href={paths.resolveRoute(params, { search: "" })}>
        <span class="i-ph-x">Close</span>
      </a>
    {/snippet}
    <header>
      <h3>
        <a href={paths.resolveRoute({ username: event.author.username })}>
          @{event.author.username}
        </a>
      </h3>
      <p style="font-size: .75em">
        {#if event.public}
          <span class="i-ph-globe-duotone">Public</span>
        {/if}
        <a href="?event={event.id}">{i18n.format(event.createdAt)}</a>
      </p>
      <p>
        Tags:
        {#each event.event.tags as tag (tag.id)}
          {tag.name},
        {/each}
      </p>
    </header>
    <p>{event.body}</p>
    <footer>
      <span class="i-ph-calendar-dot-duotone">Date</span>
      {i18n.format(event.start)}
      <form method="POST" use:enhance>
        <EventActions {event} {me} />
      </form>
    </footer>
  </Dialog>
{:else if eventInCreation}
  <EventCreationDialog
    {tags}
    {followings}
    {eventInCreation}
    {toggleEventCreation}
    timezone={me.timezone}
    {getEventInCreationElement}
  />
{:else if page.url.searchParams.has("/journal")}
  {@const date = page.url.searchParams.get("/journal")!}
  <Dialog open>
    {#snippet header()}
      <div style="flex: 1">
        <span class="i-ph-pen-nib-duotone"></span>
        {i18n.formatDay(Temporal.PlainDate.from(date))}
      </div>
      <a href={paths.resolveRoute(params, { search: "" })}>
        <span class="i-ph-x">Close</span>
      </a>
    {/snippet}
    <form
      action="?/journal={date}"
      method="POST"
      use:enhance={() => reportValidity({ reset: false })}
      class="_stack-2"
    >
      <input type="hidden" name="date" value={date} />
      <label class="_stack-2">
        {#if Temporal.PlainDate.compare(date, Temporal.Now.plainDateISO()) <= 0}
          How was your day?
        {:else}
          Who knows what the future holds?
        {/if}
        <Textarea name="body" cols={50} rows={8} value={journal?.body ?? ""} />
      </label>
      <p style="text-align: end">
        <Button color="success">Save</Button>
      </p>
    </form>
  </Dialog>
{/if}

<Layout {me} {latest}>
  {#snippet header()}
    {#if user}
      <form method="POST" class="_row-2" use:enhance>
        <h1>
          <a href="/" style="text-decoration: unset">
            <span class="i-ph-caret-left">Back</span>
          </a>
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
    <div class="_row-2">
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
        variant="ghost"
      >
        <option value="Week">Week</option>
        <option value="Month">Month</option>
        <option value="Year">Year</option>
      </Select>

      <a href="/_" style="padding: .5rem; font-size: 1.5em" class="">
        <span class="i-ph-gear-duotone">{m.cozy_moving_zebra_approve()}</span>
      </a>
    </div>
  {/snippet}

  <View {...viewProps} bind:this={component} />
</Layout>

<style lang="scss">
  h1 a {
    display: inline-block;
    padding: 0.5rem;
    font-weight: 800;
    transition:
      font-weight 150ms,
      letter-spacing 150ms;

    &:hover {
      font-weight: 850;
      letter-spacing: 0.05em;
    }
  }

  .i-ph-gear-duotone {
    transition: transform 150ms;

    a:hover & {
      transform: rotate(180deg);
    }
  }
</style>
