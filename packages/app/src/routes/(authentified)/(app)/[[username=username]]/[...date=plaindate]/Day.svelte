<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import type { Event } from "$lib/types.js";

  let {
    events,
    day,
    eventInCreation,
    timezone,
    onevent,
  }: {
    events: Event[];
    day: Temporal.PlainDate;
    eventInCreation?: Temporal.PlainDateTime;
    timezone: string;
    onevent: (event: Temporal.PlainDateTime) => void;
  } = $props();

  const today = $derived(Temporal.Now.plainDateISO(timezone));

  const fixDate = (date: Date) =>
    date.toTemporalInstant().toZonedDateTimeISO(timezone);

  const time = $derived(Temporal.Now.plainTimeISO(timezone));
  const toRems = (date: Temporal.PlainTime) =>
    // We can't just use `date.since` because of DST!
    date.since(new Temporal.PlainTime()).total({ unit: "hours" }) * 4;

  const placeEvent = (event: MouseEvent & { currentTarget: HTMLElement }) => {
    if (event.target !== event.currentTarget) return;

    const { top } = event.currentTarget.getBoundingClientRect();
    const y = event.clientY + event.currentTarget.scrollTop - top;
    const time = new Temporal.PlainTime(
      Math.floor(y / 64),
      // Make minutes a multiple of 15
      Math.floor((y % 64) / 16) * 15,
    );
    onevent(day.toPlainDateTime(time));
  };

  let eventInCreationElement = $state<HTMLElement>();
  export const getEventInCreationElement = () => eventInCreationElement;

  const gradient = (tags: Array<{ color: string }>) =>
    `linear-gradient(110deg, ${tags
      .flatMap(({ color }, i) => [
        `#${color} ${(i / tags.length) * 100 + 0.5}%`,
        `#${color} ${((i + 1) / tags.length) * 100 - 0.5}%`,
      ])
      .slice(0, -1)
      .join(", ")})`;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div class="day" onclick={placeEvent}>
  {#each { length: 23 }, hour}
    <div>
      <span>
        {Temporal.PlainTime.from({ hour: hour + 1 }).toLocaleString(
          i18n.locale,
          {
            hour: "numeric",
            minute: "numeric",
          },
        )}
      </span>
    </div>
  {/each}
  <div style="border: 0"></div>
  {#if day.equals(today)}
    <hr style:top="{toRems(time)}rem" />
  {/if}
  {#each events as { id, author, body, start, added, event } (id)}
    <article
      style="border: 2px solid #fff; text-shadow: 0 0 0.5rem #fff;"
      style:background={added
        ? event.tags.length > 1
          ? gradient(event.tags)
          : event.tags.length > 0
            ? "#" + event.tags[0].color
            : "#dcfaff"
        : "#fff"}
      style:top="{toRems(fixDate(start).toPlainTime())}rem"
    >
      @{author.username}<br />
      {body}<br />
      <a href="?event={id}">
        {fixDate(start).toLocaleString(i18n.locale, {
          hour: "numeric",
          minute: "numeric",
        })}
      </a>
    </article>
  {/each}
  {#if eventInCreation?.toPlainDate().equals(day)}
    <article
      bind:this={eventInCreationElement}
      style:top="{toRems(eventInCreation.toPlainTime())}rem"
      style="border: 2px solid #ffdcf9; background: #fff0f680; right: 0"
    >
      &nbsp;
    </article>
  {/if}
</div>

<style lang="scss">
  .day {
    contain: content;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
    }

    > div {
      width: 100%;
      border: 0;
      border-top-width: 0px;
      border-top-style: none;
      border-top-color: currentcolor;
      border-bottom: 1px solid #ccc;
      line-height: 0;
      color: #888;
      user-select: none;
      pointer-events: none;
      height: 4rem;

      > span {
        background: #fff;
        font-size: 0.8em;
        padding: 0.25em;
        transform: translateY(calc(4rem - 100%));
        display: inline-block;
      }
    }

    > article {
      position: absolute;
      padding: 0.5em;
      border-radius: 0.5em;
      left: 1em;
      margin-right: 1em;
      contain: paint;

      a::before {
        content: "";
        position: absolute;
        inset: 0;
      }
    }

    > hr {
      position: absolute;
      border: 0;
      width: 100%;
      height: 2px;
      background: red;
    }
  }
</style>
