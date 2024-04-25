<script lang="ts">
  import { Temporal } from "@js-temporal/polyfill";
  import { language } from "$lib/i18n.js";

  const { start: firstDayOfYear }: { start: Temporal.PlainDate } = $props();

  // const latest = $derived(
  //   user.events.map((event) => ({ ...event, author: user })),
  // );

  // const mosaic = $derived(
  //   new Map(
  //     data.mosaic.map(({ date, count }) => [
  //       toTemporalInstant
  //         .call(date)
  //         .toZonedDateTime({ calendar: "iso8601", timeZone: "Europe/Paris" })
  //         .toPlainDate()
  //         .toString(),
  //       count,
  //     ]),
  //   ),
  // );
  // const max = $derived(Math.max(...mosaic.values()));
  const max = 1;

  const year = $derived(firstDayOfYear.year);
  const start = $derived(
    firstDayOfYear.subtract({ days: firstDayOfYear.dayOfWeek - 1 }),
  );
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
              {date.toLocaleString($language, { month: "short" })}
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
          <!-- {@const count = mosaic.get(date.toString())} -->
          {@const count = undefined}
          <td
            title={date.toString()}
            style:background={count === undefined
              ? date.month % 2
                ? "#fff"
                : "#cce"
              : `rgb(30% 80% 40% / ${count / max})`}
          >
            {#if count !== undefined}
              {count}
            {/if}
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
    }
  }
</style>
