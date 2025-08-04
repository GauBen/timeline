<script lang="ts">
  import paths from "$lib/paths.svelte.js";
  import type { ViewProps } from "./+page.svelte";

  let { events, start, timezone, eventInCreation, onevent }: ViewProps =
    $props();

  const paddingDaysStart = $derived(start.dayOfWeek - 1);
  const numberOfWeeks = $derived(
    Math.ceil((start.dayOfWeek + start.daysInMonth - 1) / 7),
  );

  const today = $derived(Temporal.Now.plainDateISO(timezone));

  let eventInCreationElement = $state<HTMLElement>();
  export const getEventInCreationElement = () => eventInCreationElement;

  let windows = $state("then" in events ? new Map<never, never>() : events);

  $effect(() => {
    if ("then" in events) {
      events.then((events) => {
        windows = events;
      });
    }
  });
</script>

{#snippet eventInCreationMarker()}
  <article
    style="background: #fff0f680; border: 2px solid #ffdcf9"
    bind:this={eventInCreationElement}
  >
    &nbsp;
  </article>
{/snippet}

<div class="wrapper">
  <div style="position: absolute; z-index: 1">
    <a
      href={paths.resolveRoute({
        date: start.toPlainYearMonth().subtract({ months: 1 }).toString(),
      })}>Previous</a
    >
    <a
      href={paths.resolveRoute({
        date: start.toPlainYearMonth().add({ months: 1 }).toString(),
      })}>Next</a
    >
  </div>
  <table>
    <thead>
      <tr>
        {#each ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as day (day)}
          <th>{day}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each { length: numberOfWeeks }, week}
        <tr>
          {#each { length: 7 }, dayOfWeek}
            {@const day = start.add({
              days: dayOfWeek - paddingDaysStart + week * 7,
            })}
            {@const events = windows.get(day.toString()) ?? []}
            {@const index =
              eventInCreation &&
              events.filter(
                ({ start }) =>
                  Temporal.PlainDateTime.compare(
                    start.toTemporalInstant().toZonedDateTimeISO(timezone),
                    eventInCreation!,
                  ) < 0,
              ).length}
            <td
              onclick={({ target, currentTarget }) => {
                if (target !== currentTarget) return;
                onevent(day.toPlainDateTime(eventInCreation?.toPlainTime()));
              }}
            >
              {#if day.month === start.month}
                <a
                  onclick={(event) => event.stopPropagation()}
                  href={paths.resolveRoute({ date: day.toString() })}
                  style:background={day.equals(today) ? "tomato" : undefined}
                  >{day.day}</a
                >
              {/if}
              <div class="_stack-1">
                {#if eventInCreation?.toPlainDate().equals(day) && index === 0}
                  {@render eventInCreationMarker()}
                {/if}
                {#each events as { id, body, added }, i (id)}
                  <article
                    style:background={added ? "#e8faef" : "#fff"}
                    style:opacity={day.month === start.month ? 1 : 0.75}
                  >
                    <a href="?event={id}">
                      {body}
                    </a>
                  </article>
                  {#if eventInCreation
                    ?.toPlainDate()
                    .equals(day) && index === i + 1}
                    {@render eventInCreationMarker()}
                  {/if}
                {/each}
              </div>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  .wrapper {
    height: 100%;
    min-height: 0;
    overflow-y: scroll;
    background: #fff;
  }

  table {
    width: 100%;
    min-height: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }

  thead {
    position: sticky;
    top: 0;
    background: #fff8;
    backdrop-filter: blur(2px);
  }

  thead tr {
    height: 1rem;
  }

  td {
    padding: 0.5em;
    contain: content;
    vertical-align: top;
    border: 1px solid #ccc;
  }

  tbody tr {
    height: 6rem;
  }

  td > a {
    position: absolute;
    font-size: 0.8em;
    color: #888;
    user-select: none;
  }

  article {
    padding: 0.25rem;
    background: #e8faef;
    border: 2px solid #e8faef;
    border-radius: 0.5rem;
  }
</style>
