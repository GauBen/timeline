<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { ViewProps } from "./+page.svelte";

  const {
    start: firstDayOfYear,
    events,
    eventInCreation,
  }: ViewProps = $props();

  const year = $derived(firstDayOfYear.year);
  const start = $derived(
    firstDayOfYear.subtract({ days: firstDayOfYear.dayOfWeek - 1 }),
  );

  let eventInCreationElement = $state<HTMLElement>();
  export const getEventInCreationElement = () => eventInCreationElement;

  const max = $derived(
    "then" in events
      ? 1
      : Math.max(...Object.values(events.windows).map((w) => w?.length ?? 0)),
  );

  let windows = $state("then" in events ? {} : events.windows);

  $effect(() => {
    if ("then" in events) {
      events.then((events) => {
        windows = events.windows;
      });
    }
  });
</script>

<table>
  <tbody>
    <tr>
      <td></td>
      <!-- TODO: un-curse these date computations -->
      {#each { length: 53 }, week}
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
              {date.toLocaleString(i18n.locale, { month: "short" })}
            </td>
          {/if}
        {:else}
          <td></td>
        {/if}
      {/each}
    </tr>
    {#each ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as name, day (day)}
      <tr>
        <td>{name}</td>
        {#each { length: 53 }, week}
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
            {#if eventInCreation?.toPlainDate().equals(date)}
              <div bind:this={eventInCreationElement}></div>
            {/if}
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
      width: 1rem;
      height: 1rem;
      contain: paint;
      line-height: 1;
      border: 1px solid #000;
    }
  }

  a::before {
    position: absolute;
    inset: 0;
    content: "";
  }
</style>
