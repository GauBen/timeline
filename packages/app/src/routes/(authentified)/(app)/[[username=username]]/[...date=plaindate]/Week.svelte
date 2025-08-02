<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";
  import { DayBlock } from "uistiti";
  import type { ViewProps } from "./+page.svelte";
  import Day from "./Day.svelte";
  import { goto } from "$app/navigation";

  const {
    start: middle,
    eventInCreation,
    events,
    onevent,
    timezone,
  }: ViewProps = $props();

  const today = $derived(Temporal.Now.plainDateISO(timezone));

  let x = $state(0);
  let start = $derived(middle.subtract({ days: 8 }));

  const scroll: Attachment<HTMLElement> = (wrapper) => {
    wrapper.classList.remove("loading");
    wrapper.scrollLeft = wrapper.clientWidth * 2;

    let lastScrollLeft = wrapper.scrollLeft;
    let timeout: number | undefined;
    on(
      wrapper,
      "scroll",
      () => {
        if (timeout) window.clearTimeout(timeout);
        const delta = wrapper.scrollLeft - lastScrollLeft;
        x += delta;
        if (wrapper.scrollLeft < wrapper.clientWidth) {
          wrapper.scrollLeft += wrapper.clientWidth;
          goto(
            paths.resolveRoute({
              date: middle.subtract({ days: 4 }).toString(),
            }),
            { noScroll: true, keepFocus: true },
          );
        } else if (wrapper.scrollLeft > wrapper.clientWidth * 3) {
          wrapper.scrollLeft -= wrapper.clientWidth;
          goto(
            paths.resolveRoute({
              date: middle.add({ days: 4 }).toString(),
            }),
            { noScroll: true, keepFocus: true },
          );
        }
        lastScrollLeft = wrapper.scrollLeft;

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
    let a = start;
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
    let a = start;
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

  let windows = $state("then" in events ? {} : events.windows);

  $effect(() => {
    if ("then" in events) {
      events.then((events) => {
        windows = events.windows;
      });
    }
  });

  let days = $state<Record<string, ReturnType<typeof Day>>>({});
  export const getEventInCreationElement = () =>
    eventInCreation &&
    days[eventInCreation.toPlainDate().toString()]?.getEventInCreationElement();
</script>

<div class="coords">{Math.round(x)}px</div>
<div class="wrapper loading" {@attach scroll}>
  {#each months as { month, href, end, start } (month)}
    <div
      style="position: sticky; top: 0; grid-row: 1; grid-column: {start}/{end}; background: white;"
    >
      <h2 style="position: sticky; left: 0; width: 25cqw">
        <a {href}>
          {i18n.formatMonth(month)}
        </a>
      </h2>
    </div>
  {/each}
  {#each years as { year, start, end } (year)}
    <div
      style="position: sticky; top: 0; display:flex; grid-row: 1; grid-column: {start}/{end}; justify-content: end; pointer-events: none"
    >
      <h2 style="position: sticky; right: 0; width: 25cqw;text-align: right">
        <a
          style="pointer-events: all; background: white"
          href={paths.resolveRoute({ date: year.toString() })}
        >
          {year}
        </a>
      </h2>
    </div>
  {/each}
  {#each Array.from( { length: 20 }, (_, i) => start.add( { days: i }, ), ) as day (day.toString())}
    {@const { number, weekday } = i18n.dayParts(day)}
    <div class="column">
      <h3
        style="position: sticky; top: 2rem; right: 0; left: 0; z-index: 1; text-align: center; background: #fff; box-shadow: 0 0 0.5rem #fff;"
      >
        <a href="?/journal={day.toString()}">
          <DayBlock {number} {weekday} selected={day.equals(today)} />
        </a>
      </h3>
      <Day
        bind:this={days[day.toString()]}
        {day}
        withTime
        {eventInCreation}
        events={windows[day.toString()] ?? []}
        {onevent}
        {timezone}
      />
    </div>
  {/each}
</div>

<style lang="scss">
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

  .coords {
    position: fixed;
    right: 0;
    bottom: 0;
    z-index: 1000;
    padding: 10px;
    font-family: monospace;
    font-size: 14px;
    background: rgb(255 255 255 / 80%);
  }
</style>
