<script lang="ts">
  import { language, m } from "$lib/i18n.js";
  import { resolveRoute } from "$lib/paths.js";
  import type { CalendarEvent } from "$lib/types.js";
  import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
  import type { Event, User } from "@prisma/client";
  import type { Action } from "svelte/action";
  import CaretLeft from "~icons/ph/caret-left-duotone";
  import CaretRight from "~icons/ph/caret-right-duotone";
  import Day from "./Day.svelte";

  let {
    start,
    windows,
    eventInCreation = $bindable(),
  }: {
    start: Temporal.PlainDate;
    windows: Record<string, CalendarEvent[]>;
    eventInCreation?: Temporal.PlainDateTime;
  } = $props();
  const today = Temporal.Now.plainDateISO("Europe/Paris");
  const now = Temporal.Now.zonedDateTimeISO("Europe/Paris");

  const keys = $derived(
    Array.from({ length: 7 }, (_, days) => start.add({ days }).toString()),
  );

  const formatDay = (day: Temporal.PlainDate) => {
    if (day.equals(today.subtract({ days: 1 }))) return m.yesterday();
    else if (day.equals(today)) return m.today();
    else if (day.equals(today.add({ days: 1 }))) return m.tomorrow();
    return day.toLocaleString($language, { month: "short", day: "numeric" });
  };

  let calendarHeader = $state<HTMLElement>();
  let numberOfColumns = $state(1);

  const onresize = () => {
    if (!calendarHeader) return;
    numberOfColumns = window
      .getComputedStyle(calendarHeader)
      .gridTemplateColumns.split(" ").length;
  };

  const fixDate = (date: Date) =>
    toTemporalInstant.call(date).toZonedDateTimeISO("Europe/Paris");

  const toRems = (date: Temporal.PlainTime) =>
    // We can't just use `date.since` because of DST!
    date.since(new Temporal.PlainTime()).total({ unit: "hours" }) * 4;

  const scrollToRelevant: Action<
    HTMLElement,
    {
      start: Temporal.PlainDate;
      numberOfColumns: number;
      windows: Record<string, Array<Event & { author: User }>>;
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
        .map(({ date }) => fixDate(date))
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

  let days = $state<Record<string, Day>>({});
  export const getEventInCreationElement = () =>
    eventInCreation &&
    days[eventInCreation.toPlainDate().toString()]?.getEventInCreationElement();
</script>

<svelte:window {onresize} />

<div class="wrapper">
  <header bind:this={calendarHeader}>
    {#each keys as key, i}
      {@const day = Temporal.PlainDate.from(key)}
      <h2 class="_row-2">
        {#if i === 0}
          <a
            href={$resolveRoute({
              date: start.subtract({ days: 1 }).toString(),
            })}
            data-sveltekit-keepfocus
          >
            <CaretLeft />
          </a>
        {/if}
        <span style="flex: 1">{formatDay(day)}</span>
        {#if i === numberOfColumns - 1}
          <a
            href={$resolveRoute({
              date: start.add({ days: 1 }).toString(),
            })}
            data-sveltekit-keepfocus
          >
            <CaretRight />
          </a>
        {/if}
      </h2>
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
    {#each keys.slice(0, numberOfColumns) as key}
      {@const day = Temporal.PlainDate.from(key)}
      <Day
        {day}
        bind:eventInCreation
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

    h2 {
      background: #fff;
      display: flex;
      padding: 0.5rem;
      contain: paint;
    }

    > * {
      margin: 0;
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
