<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";
  import { DayBlock } from "uistiti";
  import type { ViewProps } from "./+page.svelte";

  const { start: middle }: ViewProps = $props();

  const today = Temporal.Now.plainDateISO("Europe/Paris");

  let x = $state(0);
  let start = $state(middle.subtract({ days: 8 }));

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
          start = start.subtract({ days: 4 });
        } else if (wrapper.scrollLeft > wrapper.clientWidth * 3) {
          wrapper.scrollLeft -= wrapper.clientWidth;
          start = start.add({ days: 4 });
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
  {#each { length: 20 }, i}
    {@const { number, weekday } = i18n.dayParts(start.add({ days: i }))}
    <div class="column">
      <h3
        style="position: sticky; top: 2rem; right: 0; left: 0; z-index: 1; text-align: center; background: #fff8"
      >
        <DayBlock
          {number}
          {weekday}
          selected={start.add({ days: i }).equals(today)}
        />
      </h3>
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
    height: 200%;
    scroll-snap-align: start;
    background: linear-gradient(45deg, #fcc, #ccf);
  }

  .loading .column:first-of-type {
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
