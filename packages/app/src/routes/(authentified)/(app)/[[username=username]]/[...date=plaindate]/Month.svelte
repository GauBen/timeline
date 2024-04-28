<script lang="ts">
  import { resolveRoute } from "$app/paths";
  import { page } from "$app/stores";
  import { Temporal } from "@js-temporal/polyfill";
  import type { Event, User } from "@prisma/client";

  let {
    start,
    windows,
  }: {
    start: Temporal.PlainDate;
    windows: Record<string, Array<Event & { author: User }>>;
  } = $props();

  const paddingDaysStart = $derived(start.dayOfWeek - 1);
  const numberOfWeeks = $derived(
    Math.ceil((start.dayOfWeek + start.daysInMonth - 1) / 7),
  );

  const today = Temporal.Now.plainDateISO("Europe/Paris");
</script>

<div class="wrapper">
  <div style="position: absolute; z-index: 1">
    <a
      href={resolveRoute($page.route.id!, {
        ...$page.params,
        date: start.toPlainYearMonth().subtract({ months: 1 }).toString(),
      })}
      >Previous</a
    >
    <a
      href={resolveRoute($page.route.id!, {
        ...$page.params,
        date: start.toPlainYearMonth().add({ months: 1 }).toString(),
      })}
      >Next</a
    >
  </div>
  <table>
    <thead>
      <tr>
        {#each ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as day}
          <th>{day}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each Array.from({ length: numberOfWeeks }, (_, i) => i) as week}
        <tr>
          {#each Array.from({ length: 7 }, (_, i) => i) as dayOfWeek}
            {@const day = start.add({
              days: dayOfWeek - paddingDaysStart + week * 7,
            })}
            <td>
              {#if day.month === start.month}
                <a
                  href={resolveRoute($page.route.id!, {
                    ...$page.params,
                    date: day.toString(),
                  }) + $page.url.hash}
                  style:background={day.equals(today) ? "tomato" : undefined}
                  >{day.day}</a
                >
                {#each windows[day.toString()] ?? [] as { body }}
                  <article>{body}</article>
                {/each}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  .wrapper {
    background: #fff;
    overflow-y: scroll;
    min-height: 0;
    height: 100%;
  }

  table {
    min-height: 100%;
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  thead {
    position: sticky;
    top: 0px;
    backdrop-filter: blur(2px);
    background: #fff8;
  }

  thead tr {
    height: 1rem;
  }

  td {
    contain: content;
    border: 1px solid #ccc;
    padding: 0.5em;
    vertical-align: top;
  }

  tbody tr {
    height: 6rem;
  }

  td a {
    position: absolute;
    color: #888;
    font-size: 0.8em;
    user-select: none;
  }

  article {
    background: #e8faef;
    border-radius: 0.5rem;
    padding: 0.25rem;
    margin: 0.25rem 0;
  }
</style>
