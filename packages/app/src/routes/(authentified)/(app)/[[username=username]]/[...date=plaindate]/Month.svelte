<script lang="ts">
  import { resolveRoute } from "$lib/paths.js";
  import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
  import type { Event, User } from "@prisma/client";

  let {
    start,
    windows,
    eventInCreation = $bindable(),
  }: {
    start: Temporal.PlainDate;
    windows: Record<string, Array<Event & { author: User }>>;
    eventInCreation?: Temporal.PlainDateTime;
  } = $props();

  const paddingDaysStart = $derived(start.dayOfWeek - 1);
  const numberOfWeeks = $derived(
    Math.ceil((start.dayOfWeek + start.daysInMonth - 1) / 7),
  );

  const today = Temporal.Now.plainDateISO("Europe/Paris");

  let eventInCreationElement = $state<HTMLElement>();
  export const getEventInCreationElement = () => eventInCreationElement;
</script>

{#snippet eventInCreationMarker()}
  <article
    style="border: 2px solid #ffdcf9; background: #fff0f680"
    bind:this={eventInCreationElement}
  >
    &nbsp;
  </article>
{/snippet}

<div class="wrapper">
  <div style="position: absolute; z-index: 1">
    <a
      href={$resolveRoute({
        date: start.toPlainYearMonth().subtract({ months: 1 }).toString(),
      })}>Previous</a
    >
    <a
      href={$resolveRoute({
        date: start.toPlainYearMonth().add({ months: 1 }).toString(),
      })}>Next</a
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
            {@const events = windows[day.toString()] ?? []}
            {@const index =
              eventInCreation &&
              events.filter(
                ({ date }) =>
                  Temporal.PlainDateTime.compare(
                    toTemporalInstant
                      .call(date)
                      .toZonedDateTimeISO("Europe/Paris"),
                    eventInCreation!,
                  ) < 0,
              ).length}
            <td
              onclick={({ target, currentTarget }) => {
                if (target !== currentTarget) return;
                eventInCreation = day.toPlainDateTime(
                  eventInCreation?.toPlainTime(),
                );
              }}
            >
              {#if day.month === start.month}
                <a
                  onclick={(event) => event.stopPropagation()}
                  href={$resolveRoute({ date: day.toString() })}
                  style:background={day.equals(today) ? "tomato" : undefined}
                  >{day.day}</a
                >
              {/if}
              {#if eventInCreation?.toPlainDate().equals(day) && index === 0}
                {@render eventInCreationMarker()}
              {/if}
              {#each events as { body }, i}
                <article style:opacity={day.month === start.month ? 1 : 0.75}>
                  {body}
                </article>
                {#if eventInCreation
                  ?.toPlainDate()
                  .equals(day) && index === i + 1}
                  {@render eventInCreationMarker()}
                {/if}
              {/each}
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
