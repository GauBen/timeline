<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { on } from "svelte/events";

  let x = $state(0);

  const scroll: Attachment = (wrapper) => {
    wrapper.classList.remove("loading");
    wrapper.scrollLeft = wrapper.clientWidth * 2;

    let lastScrollLeft = wrapper.scrollLeft;
    on(
      wrapper,
      "scroll",
      () => {
        const delta = wrapper.scrollLeft - lastScrollLeft;
        x += delta;
        if (wrapper.scrollLeft < wrapper.clientWidth) {
          wrapper.scrollLeft += wrapper.clientWidth;
        } else if (wrapper.scrollLeft > wrapper.clientWidth * 3) {
          wrapper.scrollLeft -= wrapper.clientWidth;
        }
        lastScrollLeft = wrapper.scrollLeft;
      },
      { passive: true },
    );
  };
</script>

<div class="coords">{x}px</div>
<div class="wrapper loading" {@attach scroll}>
  {#each { length: 20 }, i}
    <div class="column">
      <h2
        style="position: sticky; top: 0; right: 0; left: 0; z-index: 1; background: #fff8;"
      >
        Day {i}
      </h2>
    </div>
  {/each}
</div>

<style lang="scss">
  .wrapper {
    height: 100%;
    overflow-x: scroll;
    overscroll-behavior: none;
    text-wrap: nowrap;
    scroll-snap-type: x;
  }

  .column {
    display: inline-block;
    width: 25%;
    height: 200%;
    scroll-snap-align: start;
    background: linear-gradient(45deg, #fcc, #ccf);
  }

  .loading .column:first-of-type {
    margin-left: -200%;
  }

  .coords {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    padding: 10px;
    font-family: monospace;
    font-size: 14px;
    background: rgb(255 255 255 / 80%);
  }
</style>
