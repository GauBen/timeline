<script lang="ts">
  import { toTemporalInstant, Temporal } from "@js-temporal/polyfill";
  const { data } = $props();

  const start = $derived(Temporal.ZonedDateTime.from(data.date));

  const previous = $derived(
    Temporal.PlainDate.from(data.date).subtract({ months: 1 }),
  );
  const next = $derived(Temporal.PlainDate.from(data.date).add({ months: 1 }));

  const paddingDaysStart = $derived(start.dayOfWeek - 1);
  const numberOfWeeks = $derived(
    Math.ceil((start.dayOfWeek + start.daysInMonth - 1) / 7),
  );

  const fixDate = (date: Date) =>
    toTemporalInstant.call(date).toZonedDateTime({
      calendar: "iso8601",
      timeZone: "Europe/Paris",
    });

  const groupedEvents = $derived(
    Map.groupBy(data.events, ({ date }) =>
      fixDate(date).toPlainDate().toString(),
    ),
  );
</script>

<p style="display: flex; justify-content: space-between">
  <a href="../{previous.toString().slice(0, 7).replaceAll('-', '/')}"
    >Previous</a
  >
  <a href="../{next.toString().slice(0, 7).replaceAll('-', '/')}">Next</a>
</p>

<table>
  <thead>
    <tr>
      {#each ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as day}
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
          {@const index = day.toPlainDate().toString()}
          <td>
            {#if day.month === start.month}
              <a href="{day.month}/{day.day}">{day.day}</a>
            {/if}
            {#each groupedEvents.get(index) ?? [] as { author, body, date }}
              <article>
                @{author.username}<br />
                {body}<br />
                {fixDate(date).toLocaleString(data.language, {
                  hour: "numeric",
                  minute: "numeric",
                })}
              </article>
            {/each}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  article {
    background: skyblue;
    padding: 0.5em;
    border-radius: 0.5em;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
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
</style>
