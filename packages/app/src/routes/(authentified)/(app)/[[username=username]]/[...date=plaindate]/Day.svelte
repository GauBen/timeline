<script lang="ts">
  import { page } from "$app/state";
  import i18n from "$lib/i18n.svelte.js";
  import { getEventsForDate } from "./events.remote.js";

  let {
    day,
    eventInCreation,
    timezone,
    withTime,
    onevent,
  }: {
    day: Temporal.PlainDate;
    eventInCreation?: Temporal.PlainDateTime;
    timezone: string;
    withTime: boolean;
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

  const events = $derived(
    await getEventsForDate({
      date: day.toString(),
      username: page.params.username,
    }),
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div class="day" onclick={placeEvent}>
  {#each { length: 23 }, hour}
    <div>
      {#if withTime}
        <span>
          {Temporal.PlainTime.from({ hour: hour + 1 }).toLocaleString(
            i18n.locale,
            { hour: "numeric", minute: "numeric" },
          )}
        </span>
      {/if}
    </div>
  {/each}
  <div style="border: 0"></div>
  {#if day.equals(today)}
    <hr style:top="{toRems(time)}rem" />
  {/if}
  {#each events as { id, author, body, start, added, event } (id)}
    <article
      style="text-shadow: 0 0 0.5rem #fff; border: 2px solid #fff;"
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
      style=" right: 0; background: #fff0f680;border: 2px solid #ffdcf9"
    >
      &nbsp;
    </article>
  {/if}
</div>

<style lang="scss">
  .day {
    contain: content;

    &::before {
      position: absolute;
      inset: 0;
      content: "";
    }

    > div {
      width: 100%;
      height: 4rem;
      line-height: 0;
      color: #888;
      pointer-events: none;
      user-select: none;
      border: 0;
      border-top: 0 none currentcolor;
      border-bottom: 1px solid #ccc;

      > span {
        position: sticky;
        left: 0;
        display: inline-block;
        padding: 0.25em;
        font-size: 0.8em;
        background: #fff;
        transform: translateY(calc(4rem - 100%));
      }
    }

    > article {
      position: absolute;
      left: 1em;
      padding: 0.5em;
      margin-right: 1em;
      contain: paint;
      border-radius: 0.5em;

      a::before {
        position: absolute;
        inset: 0;
        content: "";
      }
    }

    > hr {
      position: absolute;
      width: 100%;
      height: 2px;
      background: red;
      border: 0;
    }
  }
</style>
