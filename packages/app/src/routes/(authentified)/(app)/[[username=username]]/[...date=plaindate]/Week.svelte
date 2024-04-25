<script lang="ts">
  import { language, m } from "$lib/i18n.js";
  import { Temporal } from "@js-temporal/polyfill";
  import type { Event, User } from "@prisma/client";
  import CaretLeft from "~icons/ph/caret-left-duotone";
  import CaretRight from "~icons/ph/caret-right-duotone";
  import Day from "./Day.svelte";

  let {
    start,
    windows,
    eventInCreation = $bindable(),
  }: {
    start: string;
    windows: Record<string, Array<Event & { author: User }>>;
    eventInCreation?: Temporal.PlainDateTime;
  } = $props();
  const today = Temporal.Now.plainDateISO("Europe/Paris");
  const startDay = $derived(Temporal.PlainDate.from(start));

  const keys = $derived(
    Array.from({ length: 7 }, (_, days) => startDay.add({ days }).toString()),
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

  $effect(onresize);
</script>

<svelte:window {onresize} />

<header bind:this={calendarHeader}>
  {#each keys as key, i}
    {@const day = Temporal.PlainDate.from(key)}
    <h2 class="_row-2">
      {#if i === 0}
        <a href="/{startDay.subtract({ days: 1 }).toString()}">
          <CaretLeft />
        </a>
      {/if}
      <span style="flex: 1">{formatDay(day)}</span>
      {#if i === numberOfColumns - 1}
        <a
          href="/{startDay.add({ days: 1 }).toString()}"
          style="position: absolute; right: .5rem"
        >
          <CaretRight />
        </a>
      {/if}
    </h2>
  {/each}
</header>
<div class="scroll">
  {#each keys as key}
    {@const day = Temporal.PlainDate.from(key)}
    <Day events={windows[key] ?? []} {day} bind:eventInCreation />
  {/each}
</div>

<style lang="scss">
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
