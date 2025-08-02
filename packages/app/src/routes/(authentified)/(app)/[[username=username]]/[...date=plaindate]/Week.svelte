<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";
  import { DayBlock } from "uistiti";

  let x = $state(0);
  let start = $state(
    Temporal.Now.zonedDateTimeISO("Europe/Paris")
      .toPlainDate()
      .subtract({ days: 8 }),
  );

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
          //wrapper.scrollLeft += wrapper.clientWidth;
          //start = start.subtract({ days: 4 });
        } else if (wrapper.scrollLeft > wrapper.clientWidth * 3) {
          //wrapper.scrollLeft -= wrapper.clientWidth;
          //start = start.add({ days: 4 });
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
</script>

<div class="coords">{Math.round(x)}px</div>
<div class="wrapper loading" {@attach scroll}>
  <div style=" position:sticky; left: 0;grid-column: 1; background: white;">
    July
  </div>
  <div style="grid-column: 2/8"></div>
  <div style=" position:sticky; left: 0;grid-column: 8; background: white;">
    August
  </div>
  <div style="grid-column: 9/21"></div>
  {#each { length: 20 }, i}
    {@const { number, weekday } = i18n.dayParts(start.add({ days: i }))}
    <div class="column">
      <h2
        style="position: sticky; top: 0; right: 0; left: 0; z-index: 1; text-align: center; background: #fff8"
      >
        <DayBlock {number} {weekday} selected={false} />
      </h2>
    </div>
  {/each}
</div>

<style lang="scss">
  .wrapper {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: repeat(20, 1fr);
    height: 100%;
    container-type: inline-size;
    overflow: scroll;
    overscroll-behavior: none;
    text-wrap: nowrap;
    scrollbar-width: auto;
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
