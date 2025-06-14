<script lang="ts">
  import { enhance } from "$app/forms";
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { Event } from "$lib/types.js";
  import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
  import type { Action } from "svelte/action";
  import CaretLeft from "~icons/ph/caret-left-duotone";
  import CaretRight from "~icons/ph/caret-right-duotone";
  import Spinner from "~icons/ph/spinner";
  import type { ViewProps } from "./+page.svelte";
  import Day from "./Day.svelte";

  let { start, events, timezone, eventInCreation, onevent }: ViewProps =
    $props();
  const today = $derived(Temporal.Now.plainDateISO(timezone));
  const now = $derived(Temporal.Now.zonedDateTimeISO(timezone));

  const keys = $derived(
    Array.from({ length: 7 }, (_, days) => start.add({ days }).toString()),
  );

  let calendarHeader = $state<HTMLElement>();
  let numberOfColumns = $state(1);

  const onresize = () => {
    if (!calendarHeader) return;
    numberOfColumns = window
      .getComputedStyle(calendarHeader)
      .gridTemplateColumns.split(" ").length;
  };

  const fixDate = (date: Date) =>
    toTemporalInstant.call(date).toZonedDateTimeISO(timezone);

  const toRems = (date: Temporal.PlainTime) =>
    // We can't just use `date.since` because of DST!
    date.since(new Temporal.PlainTime()).total({ unit: "hours" }) * 4;

  const scrollToRelevant: Action<
    HTMLElement,
    {
      start: Temporal.PlainDate;
      numberOfColumns: number;
      windows: Record<string, Array<Event> | undefined>;
      eventInCreation?: Temporal.PlainDateTime;
    }
  > = (node, params) => {
    const update = ({ start, numberOfColumns, windows }: typeof params) => {
      const keys = Array.from({ length: numberOfColumns }, (_, days) =>
        start.add({ days }).toString(),
      );

      if (
        eventInCreation &&
        keys.includes(eventInCreation.toPlainDate().toString())
      ) {
        const top = toRems(eventInCreation.toPlainTime()) * 16;
        if (node.scrollTop + node.offsetHeight < top || node.scrollTop > top)
          node.scrollTo({ top });
        return;
      }

      const includesToday = keys.includes(today.toString());
      const [first] = keys
        .flatMap((key) => windows[key] ?? [])
        .map(({ start }) => fixDate(start))
        // If the current day is displayed, target the first upcoming event,
        // otherwise target the first event
        .filter(
          (date) =>
            !includesToday || Temporal.ZonedDateTime.compare(date, now) > 0,
        );

      if (first) {
        const top = toRems(first.toPlainTime()) * 16;
        if (node.scrollTop + node.offsetHeight < top || node.scrollTop > top)
          node.scrollTo({ top });
        return;
      }

      node.scrollTo({
        top:
          toRems(
            includesToday ? now.toPlainTime() : new Temporal.PlainTime(7, 30),
          ) * 16,
      });
    };
    update(params);
    return { update };
  };

  $effect(onresize);

  let days = $state<Record<string, ReturnType<typeof Day>>>({});
  export const getEventInCreationElement = () =>
    eventInCreation &&
    days[eventInCreation.toPlainDate().toString()]?.getEventInCreationElement();

  let processedHabits = $state(
    "then" in events
      ? undefined
      : events.habits &&
          events.habits.length > 0 &&
          events.habits.map(({ id, name, marks }) => ({
            id,
            name,
            days: new Set(
              marks.map(({ date }) =>
                toTemporalInstant
                  .call(date)
                  .toZonedDateTimeISO(timezone)
                  .toPlainDate()
                  .toString(),
              ),
            ),
          })),
  );

  $effect(() => {
    if ("then" in events) {
      events.then(({ habits }) => {
        processedHabits =
          habits &&
          habits.length > 0 &&
          habits.map(({ id, name, marks }) => ({
            id,
            name,
            days: new Set(
              marks.map(({ date }) =>
                toTemporalInstant
                  .call(date)
                  .toZonedDateTimeISO(timezone)
                  .toPlainDate()
                  .toString(),
              ),
            ),
          }));
      });
    }
  });

  let windows = $state("then" in events ? {} : events.windows);

  $effect(() => {
    if ("then" in events) {
      events.then((events) => {
        windows = events.windows;
      });
    }
  });
</script>

<svelte:window {onresize} />

<div class="wrapper">
  <header bind:this={calendarHeader}>
    {#each keys as key, i (key)}
      {@const day = Temporal.PlainDate.from(key)}
      <div class="column">
        <h2 class="_row-2">
          {#if i === 0}
            <a
              href={paths.resolveRoute({
                date: start.subtract({ days: 1 }).toString(),
              })}
              data-sveltekit-keepfocus
            >
              <CaretLeft />
            </a>
          {/if}
          {#if !windows[key]}
            <Spinner class="icon i-spin" aria-label="Loading" />
          {/if}
          <a
            style="flex: 1; text-decoration: inherit;"
            href="?/journal={day.toString()}"
          >
            {i18n.formatDay(day)}
          </a>
          {#if i === numberOfColumns - 1}
            <a
              href={paths.resolveRoute({
                date: start.add({ days: 1 }).toString(),
              })}
              data-sveltekit-keepfocus
            >
              <CaretRight />
            </a>
          {/if}
        </h2>
        {#if processedHabits}
          <div class="_row-2">
            {#each processedHabits as { id, name, days } (id)}
              <form method="post" action="?/markHabit" use:enhance>
                <input type="hidden" name="habitId" value={id} />
                <input type="hidden" name="date" value={key} />
                <button
                  type="submit"
                  name="mark"
                  value={(!days.has(key)).toString()}
                >
                  {days.has(key) ? "☑️" : "⬜"}
                  {name}
                </button>
              </form>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </header>
  <div
    class="scroll"
    use:scrollToRelevant={{
      start,
      numberOfColumns,
      windows,
      eventInCreation,
    }}
  >
    {#each keys as key (key)}
      {@const day = Temporal.PlainDate.from(key)}
      <Day
        {day}
        {onevent}
        {timezone}
        {eventInCreation}
        bind:this={days[key]}
        events={windows[key] ?? []}
      />
    {/each}
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
  }

  header {
    box-shadow: 0 0 0.5rem #19191a10;
    z-index: 1;

    .column {
      background: #fff;
      padding: 0.5rem;
      contain: paint;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    h2 {
      background: #fff;
      display: flex;
    }
  }

  header,
  .scroll {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    grid-template-rows: auto;
    grid-auto-rows: 0;
    contain: paint;
    column-gap: 1px;
  }

  .scroll {
    overflow-y: scroll;
    min-height: 0;

    > :global(*) {
      background: #fff;
    }
  }
</style>
