<script lang="ts" context="module">
  /** Allows other Day instances to cancel another event creation. */
  let cancelCreateEvent = $state<() => void>();

  export const cancel = () => cancelCreateEvent?.();
</script>

<script lang="ts">
  import { language } from "$lib/i18n.js";
  import { toTemporalInstant, Temporal } from "@js-temporal/polyfill";
  import type { Event, User } from "@prisma/client";
  import type { Action } from "svelte/action";

  const {
    events,
    today,
    oncreatestart,
    oncancel,
  }: {
    events: Array<Event & { author: User }>;
    today: boolean;
    oncreatestart?: (event: NonNullable<typeof placedEvent>) => void;
    oncancel?: () => void;
  } = $props();

  const fixDate = (date: Date) =>
    toTemporalInstant
      .call(date)
      .toZonedDateTime({ calendar: "iso8601", timeZone: "Europe/Paris" });

  const time = Temporal.Now.plainTimeISO("Europe/Paris");
  const toRems = (date: Temporal.PlainTime) =>
    // We can't just use `date.since` because of DST!
    date.since(new Temporal.PlainTime()).total({ unit: "hours" }) * 4;

  const scrollToRelevant: Action<HTMLElement, Array<{ date: Date }>> = (
    node,
    events,
  ) => {
    const update = ([first]: typeof events) => {
      node.scrollTo({
        top:
          toRems(
            first
              ? fixDate(first.date).toPlainTime()
              : new Temporal.PlainTime(7, 30),
          ) * 16,
      });
    };
    update(events);
    return { update };
  };

  let placedEvent = $state<{ time: Temporal.PlainTime }>();
  const placeEvent = (event: MouseEvent & { currentTarget: HTMLElement }) => {
    if (event.target !== event.currentTarget) return;
    cancelCreateEvent?.();

    const { top } = event.currentTarget.getBoundingClientRect();
    const y = event.clientY + event.currentTarget.scrollTop - top;
    const time = new Temporal.PlainTime(
      Math.floor(y / 64),
      // Make minutes a multiple of 15
      Math.floor((y % 64) / 16) * 15,
    );
    placedEvent = { time };
    oncreatestart?.(placedEvent);
    cancelCreateEvent = () => {
      oncancel?.();
      placedEvent = undefined;
    };
  };
</script>

<svelte:window
  onkeydown={({ key }) => {
    if (placedEvent && key === "Escape") {
      oncancel?.();
      placedEvent = undefined;
    }
  }}
/>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="scroll" use:scrollToRelevant={events}>
  <div class="day" onclick={placeEvent}>
    {#each Array.from({ length: 23 }, (_, i) => i + 1) as hour}
      <div>
        <span>
          {Temporal.PlainTime.from({ hour }).toLocaleString($language, {
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
      </div>
    {/each}
    <div style="border: 0" />
    {#if today}
      <hr style:top="{toRems(time)}rem" />
    {/if}
    {#each events as { author, body, date }}
      <article
        style="background: #dcfaff"
        style:top="{toRems(fixDate(date).toPlainTime())}rem"
      >
        @{author.username}<br />
        {body}<br />
        {fixDate(date).toLocaleString($language, {
          hour: "numeric",
          minute: "numeric",
        })}
      </article>
    {/each}
    {#if placedEvent}
      <article
        style="border: 2px solid #ffdcf9; background: #fff0f680; right: 0"
        style:top="{toRems(placedEvent.time)}rem"
      >
        &nbsp;
      </article>
    {/if}
  </div>
</div>

<style lang="scss">
  .scroll {
    overflow-y: scroll;
  }

  .day {
    contain: content;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
    }

    > div {
      width: 100%;
      margin: 0;
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
    }

    > hr {
      position: absolute;
      margin: 0;
      border: 0;
      width: 100%;
      height: 2px;
      background: red;
    }
  }
</style>
