<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";
  import { DayBlock } from "uistiti";
  import type { ViewProps } from "./+page.svelte";
  import Day from "./Day.svelte";
  import { replaceState } from "$app/navigation";
  import { getEvents } from "./events.remote.js";
  import { page } from "$app/state";

  /** Number of days to display. */
  const numberOfDays = 4;
  const numberOfBufferedDays = 1;
  const numberOfPaddingDays = 10;

  const { start, eventInCreation, events, onevent, timezone }: ViewProps =
    $props();

  const today = $derived(Temporal.Now.plainDateISO(timezone));

  let bufferStart = $state(
    start.subtract({ days: numberOfPaddingDays + numberOfBufferedDays }),
  );

  let eventBufferStart = start.subtract({ days: 7 });
  let eventBufferEnd = start.add({ days: 7 });

  $effect(() => {
    if (
      Temporal.PlainDate.compare(
        start.subtract({ days: 6 }),
        eventBufferStart,
      ) < 0
    ) {
      getEvents({
        end: eventBufferStart,
        start: (eventBufferStart = start.subtract({ days: 10 })),
        username: page.params.username,
      }).then((e) => {
        for (const [day, list] of e) events.set(day, list);
      });
    }

    if (
      Temporal.PlainDate.compare(
        start.add({ days: numberOfDays + 6 }),
        eventBufferEnd,
      ) > 0
    ) {
      getEvents({
        start: eventBufferEnd,
        end: (eventBufferEnd = start.add({ days: 10 + numberOfDays })),
        username: page.params.username,
      }).then((e) => {
        for (const [day, list] of e) events.set(day, list);
      });
    }
  });

  /**
   * Keep a local copy of start, updated separately, to know if start changes
   * from the outside.
   */
  let now = start;

  const scroll: Attachment<HTMLElement> = (wrapper) => {
    wrapper.classList.remove("loading");
    wrapper.scrollLeft =
      (wrapper.clientWidth / numberOfDays) *
      (numberOfPaddingDays + numberOfBufferedDays);

    let timeout: number | undefined;
    on(
      wrapper,
      "scroll",
      async () => {
        if (timeout) window.clearTimeout(timeout);

        const dayWidth = wrapper.clientWidth / numberOfDays;

        now = bufferStart.add({
          days: Math.round(wrapper.scrollLeft / dayWidth),
        });
        if (!now.equals(start)) {
          replaceState(paths.resolveRoute({ date: now.toString() }), {
            start: now,
          });
        }

        if (wrapper.scrollLeft < dayWidth * numberOfPaddingDays) {
          wrapper.scrollLeft += dayWidth * numberOfBufferedDays;
          bufferStart = bufferStart.subtract({ days: numberOfBufferedDays });
        } else if (
          wrapper.scrollLeft >
          (numberOfDays + numberOfPaddingDays + numberOfBufferedDays * 2) *
            dayWidth
        ) {
          wrapper.scrollLeft -= dayWidth * numberOfBufferedDays;
          bufferStart = bufferStart.add({ days: numberOfBufferedDays });
        }

        wrapper.style.setProperty("scroll-snap-type", "none");
        timeout = window.setTimeout(() => {
          wrapper.style.setProperty("scroll-snap-type", "x");
          wrapper.style.setProperty("scroll-behavior", "smooth");
          on(
            wrapper,
            "scroll",
            () => wrapper.style.setProperty("scroll-behavior", "auto"),
            { passive: true, once: true },
          );
          timeout = undefined;
        }, 200);
      },
      { passive: true },
    );
  };

  const months = $derived.by(() => {
    let a = bufferStart;
    let days = 0;
    const months: Array<{
      month: number;
      href: string;
      end: number;
      start: number;
    }> = [];
    while (days < 20) {
      const month = a.month;
      const daysLeft = a.daysInMonth - a.day + 1;
      months.push({
        month,
        href: a.toString().slice(0, 7),
        end: days + daysLeft + 1,
        start: days + 1,
      });
      days += daysLeft;
      a = a.add({ days: daysLeft });
    }
    return months;
  });

  const years = $derived.by(() => {
    let a = bufferStart;
    const years: Array<{ year: number; start: number; end: number }> = [];
    let days = 0;
    while (days < 20) {
      const year = a.year;
      const daysInYear = a.daysInYear - a.dayOfYear + 1;
      years.push({
        year,
        start: days + 1,
        end: days + daysInYear + 1,
      });
      days += daysInYear;
      a = a.add({ days: daysInYear });
    }
    return years;
  });

  let days = $state<Record<string, ReturnType<typeof Day>>>({});
  export const getEventInCreationElement = () =>
    eventInCreation &&
    days[eventInCreation.toPlainDate().toString()]?.getEventInCreationElement();
</script>

<div
  class="wrapper loading"
  {@attach scroll}
  {@attach (wrapper) => {
    // Reset the scroll position when start changes externally
    if (!start.equals(now)) {
      bufferStart = start.subtract({
        days: numberOfPaddingDays + numberOfBufferedDays,
      });
      wrapper.scrollTo({
        left:
          (wrapper.clientWidth / numberOfDays) *
          (numberOfPaddingDays + numberOfBufferedDays),
        behavior: "instant",
      });
    }
  }}
>
  {#each months as { month, href, end, start } (month)}
    <div
      style="position: sticky; top: 0; z-index:1; grid-row: 1; grid-column: {start}/{end}; background: white;"
    >
      <h2 style="position: sticky; left: 0; width: 25cqw">
        <a {href} style="padding: .25rem">
          {i18n.formatMonth(month)}
        </a>
      </h2>
    </div>
  {/each}
  {#each years as { year, start, end } (year)}
    <div
      style="position: sticky; top: 0; z-index: 2; display:flex; grid-row: 1; grid-column: {start}/{end}; justify-content: end; pointer-events: none;"
    >
      <h2 style="position: sticky; right: 0; width: 25cqw; text-align: right">
        <a
          style=" padding: .25rem;pointer-events: all; background: white"
          href={paths.resolveRoute({ date: year.toString() })}
        >
          {year}
        </a>
      </h2>
    </div>
  {/each}
  {#each Array.from( { length: numberOfDays + numberOfBufferedDays * 2 + numberOfPaddingDays * 2 }, (_, i) => bufferStart.add( { days: i }, ), ) as day (day.toString())}
    {@const { number, weekday } = i18n.dayParts(day)}
    <div class="column">
      <h3>
        <a href="?/journal={day.toString()}">
          <DayBlock {number} {weekday} selected={day.equals(today)} />
        </a>
      </h3>
      <Day
        bind:this={days[day.toString()]}
        {day}
        withTime
        {eventInCreation}
        events={events.get(day.toString()) ?? []}
        {onevent}
        {timezone}
      />
    </div>
  {/each}
</div>

<style lang="scss">
  h3 {
    position: sticky;
    top: 2rem;
    right: 0;
    left: 0;
    z-index: 1;
    text-align: center;
    background: #fff;
  }

  h3::after {
    position: absolute;
    right: 0;
    bottom: -0.5rem;
    left: 0;
    height: 0.5rem;
    content: "";
    background: linear-gradient(to top, transparent, #ccc4);
  }

  .wrapper {
    display: inline-grid;
    grid-template-rows: 2rem 1fr;
    grid-template-columns: repeat(20, 1fr);
    width: 100%;
    height: 100%;
    container-type: inline-size;
    overflow: scroll;
    overscroll-behavior: none;
    text-wrap: nowrap;
    scrollbar-width: none;
  }

  .column {
    display: inline-block;
    width: 25cqw;
    scroll-snap-align: start;
    background: #fff;
  }

  .loading .column {
    margin-left: -200%;
  }
</style>
