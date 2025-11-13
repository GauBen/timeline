<script module lang="ts">
  import { resolve } from "$app/paths";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Dialog from "$lib/components/Dialog.svelte";
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { Event } from "$lib/types.js";
  import { reportValidity } from "formgator/sveltekit";
  import { m } from "messages";
  import { SvelteMap } from "svelte/reactivity";
  import { Button, Select, Textarea } from "uistiti";
  import type { PageData } from "./$types.js";
  import EventActions from "./EventActions.svelte";
  import EventCreationDialog from "./EventCreationDialog.svelte";
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
        { date: page.state.start?.toString() || page.params.date },
        {
          search: datetime
            ? `?${new URLSearchParams({ new: datetime.toString() })}`
            : "",
        },
      ),
      { keepFocus: true, noScroll: true, state: page.state },
    );
  };

  export interface ViewProps {
    start: PageData["start"];
    timezone: PageData["me"]["timezone"];
    events: Awaited<PageData["events"]>;
    eventInCreation: PageData["eventInCreation"];
    onevent: typeof toggleEventCreation;
  }
</script>

<script lang="ts">
  const { data, params } = $props();
  const {
    event,
    eventInCreation,
    followed,
    followings,
    journal,
    habits,
    latest,
    me,
    tags,
    user,
    view,
  } = $derived(data);

  const start = $derived(page.state.start ?? data.start);
  const events = new SvelteMap<string, Array<Event>>(
    "then" in data.events ? [] : data.events,
  );

  $effect(() => {
    if ("then" in data.events) {
      data.events.then((e) => {
        for (const [day, list] of e) events.set(day, list);
      });
    }
  });

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
    <div class="_stack-4">
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
          <Textarea
            name="body"
            cols={50}
            rows={8}
            value={journal?.body ?? ""}
          />
        </label>
        <p style="text-align: end">
          <Button color="success">Save</Button>
        </p>
      </form>

      <hr />

      {#if habits && habits.length > 0}
        <div class="_row-2">
          {#each habits as { id, name, marks } (id)}
            <form method="post" action="?/markHabit" use:enhance>
              <input type="hidden" name="habitId" value={id} />
              <input type="hidden" name="date" value={date} />
              <Button
                type="submit"
                name="mark"
                value={String(marks.length === 0)}
                variant="ghost"
                square
              >
                <span
                  class={marks.length > 0
                    ? "i-ph-check-circle-duotone"
                    : "i-ph-circle"}
                ></span>
                {name}
              </Button>
            </form>
          {/each}
        </div>
      {:else}
        <p>
          You don't have any habits set up yet. <a href={resolve("/_/habits")}>
            Set some up!
          </a>
        </p>
      {/if}
    </div>
  </Dialog>
{/if}

<Layout {me} {latest}>
  {#snippet header()}
    {#if user}
      <form method="POST" class="_row-2" use:enhance>
        <div class="_row-2" style="padding: .5rem; font-size: 2em">
          <a href={resolve("/")}>
            <span class="i-ph-caret-left">Back</span>
          </a>
          <span
            style="display: inline-block; width: 2rem; height: 2rem; background: purple; border-radius: 1rem"
          ></span>
          {user.displayName}
        </div>
        {#if followed}
          <Button color="danger" formaction="?/unfollow">Unfollow</Button>
        {:else}
          <Button formaction="?/follow">Follow</Button>
        {/if}
      </form>
    {:else}
      <div class="_row-2">
        <a
          href={resolve("/")}
          class="_row-2"
          style="padding: .5rem; font-family: Cookie, serif; font-size: 2em; text-decoration: none"
        >
          <img src="/logo.svg" alt="" style="height: 1.25em" />
          whenbanana
        </a>
      </div>
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

      <a href={resolve("/_")} style="padding: .5rem; font-size: 1.5em" class="">
        <span class="i-ph-gear-duotone">{m.cozy_moving_zebra_approve()}</span>
      </a>
    </div>
  {/snippet}

  <View {...viewProps} bind:this={component} />
</Layout>

<style lang="scss">
  .i-ph-gear-duotone {
    transition: transform 150ms;

    a:hover & {
      transform: rotate(180deg);
    }
  }
</style>
