<script lang="ts">
  import { language } from "$lib/i18n.js";
  import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
  import type { Event, User } from "@prisma/client";

  let {
    events,
    day,
    eventInCreation = $bindable(),
  }: {
    events: Array<Event & { author: User }>;
    day: Temporal.PlainDate;
    eventInCreation?: Temporal.PlainDateTime;
  } = $props();

  const today = Temporal.Now.plainDateISO("Europe/Paris");

  const fixDate = (date: Date) =>
    toTemporalInstant.call(date).toZonedDateTimeISO("Europe/Paris");

  const time = Temporal.Now.plainTimeISO("Europe/Paris");
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
    eventInCreation = day.toPlainDateTime(time);
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
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
  <div style="border: 0"></div>
  {#if day.equals(today)}
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
  {#if eventInCreation?.toPlainDate().equals(day)}
    <article
      style="border: 2px solid #ffdcf9; background: #fff0f680; right: 0"
      style:top="{toRems(eventInCreation.toPlainTime())}rem"
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
