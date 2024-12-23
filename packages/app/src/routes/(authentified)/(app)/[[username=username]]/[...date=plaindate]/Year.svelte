<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { Event } from "$lib/types.js";
  import { Temporal } from "@js-temporal/polyfill";

  const {
    start: firstDayOfYear,
    windows,
    eventInCreation,
  }: {
    start: Temporal.PlainDate;
    windows: Record<string, Event[] | undefined>;
    eventInCreation?: Temporal.PlainDateTime;
    onevent: (event: Temporal.PlainDateTime) => void;
  } = $props();

  const max = $derived(
    Math.max(...Object.values(windows).map((w) => w?.length ?? 0)),
  );

  const year = $derived(firstDayOfYear.year);
  const start = $derived(
    firstDayOfYear.subtract({ days: firstDayOfYear.dayOfWeek - 1 }),
  );

  let eventInCreationElement = $state<HTMLElement>();
  export const getEventInCreationElement = () => eventInCreationElement;
</script>

<table>
  <tbody>
    <tr>
      <td></td>
      <!-- TODO: un-curse these date computations -->
      {#each Array.from({ length: 53 }) as _, week}
        {@const date = start.add({ weeks: week })}
        {#if date.year === year}
          {#if date.day <= 7}
            {@const nextMonth = date
              .add({ months: 1 })
              .toPlainYearMonth()
              .toPlainDate({ day: 1 })}
            <td
              colspan={date
                .until(nextMonth, {
                  smallestUnit: "week",
                  roundingIncrement: 1,
                  roundingMode: "ceil",
                })
                .total({ unit: "week", relativeTo: date })}
            >
              {date.toLocaleString(i18n.language, { month: "short" })}
              {#if eventInCreation?.toPlainDate().equals(date)}
                <span bind:this={eventInCreationElement}></span>
              {/if}
            </td>
          {/if}
        {:else}
          <td></td>
        {/if}
      {/each}
    </tr>
    {#each ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as name, day}
      <tr>
        <td>{name}</td>
        {#each Array.from({ length: 53 }) as _, week}
          {@const date = start.add({ weeks: week, days: day })}
          {@const count = windows[date.toString()]?.length}
          <td
            title={date.toString()}
            style:background={eventInCreation?.toPlainDate().equals(date)
              ? "pink"
              : count === undefined
                ? date.month % 2
                  ? "#fff"
                  : "#cce"
                : `rgb(30% 80% 40% / ${count / max})`}
          >
            <a href={paths.resolveRoute({ date: date.toString() })}>
              {#if count !== undefined}
                {count}
              {/if}
            </a>
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  table {
    width: 100%;
    border-collapse: collapse;

    td {
      border: 1px solid #000;
      height: 1rem;
      width: 1rem;
      line-height: 1;
      contain: paint;
    }
  }

  a::before {
    content: "";
    position: absolute;
    inset: 0;
  }
</style>
