<script lang="ts">
  import { Temporal } from "@js-temporal/polyfill";

  const { start }: { start: Temporal.PlainDate } = $props();

  const previous = $derived(start.subtract({ months: 1 }));
  const next = $derived(start.add({ months: 1 }));

  const paddingDaysStart = $derived(start.dayOfWeek - 1);
  const numberOfWeeks = $derived(
    Math.ceil((start.dayOfWeek + start.daysInMonth - 1) / 7),
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
              <a href="{day.month}/{day.day}">{day.day}</a>
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
