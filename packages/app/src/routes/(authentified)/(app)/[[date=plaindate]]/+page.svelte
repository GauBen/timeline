<script lang="ts">
  import { m } from "$lib/i18n.js";
  import "uistiti/global.css";
  import Calendar from "~icons/ph/calendar-dot-duotone";
  import CaretLeft from "~icons/ph/caret-left-duotone";
  import CaretRight from "~icons/ph/caret-right-duotone";
  import { toTemporalInstant, Temporal } from "@js-temporal/polyfill";
  import type { Action } from "svelte/action";

  const { data } = $props();
  const { latest, windows } = $derived(data);
  const start = $derived(Temporal.PlainDate.from(data.start));

  const formatDay = (day: string) => {
    const today = Temporal.Now.plainDateISO("Europe/Paris");
    if (day === today.subtract({ days: 1 }).toString()) return m.yesterday();
    else if (day === today.toString()) return m.today();
    else if (day === today.add({ days: 1 }).toString()) return m.tomorrow();

    return Temporal.PlainDate.from(day).toLocaleString(data.language, {
      month: "short",
      day: "numeric",
    });
  };

  const formatter = new Intl.RelativeTimeFormat(data.language, {
    numeric: "auto",
  });
  const thresholds = {
    seconds: 60,
    minutes: 60,
    hours: 24,
    days: 30.4375,
    months: 12,
  };
  const format = (date: Date) => {
    let diff = (date.getTime() - Date.now()) / 1000;
    for (const [unit, threshold] of Object.entries(thresholds)) {
      if (Math.abs(diff) < threshold) {
        return formatter.format(
          Math.round(diff),
          unit as Intl.RelativeTimeFormatUnit,
        );
      }
      diff /= threshold;
    }
    return formatter.format(Math.round(diff), "years");
  };

  const fixDate = (date: Date) =>
    toTemporalInstant.call(date).toZonedDateTime({
      calendar: "iso8601",
      timeZone: "Europe/Paris",
    });

  const time = Temporal.Now.plainTimeISO("Europe/Paris");
  const toRems = (date: Temporal.PlainTime) =>
    // We can't just use `date.since` because of DST!
    date.since(new Temporal.PlainTime()).total({ unit: "hours" }) * 4;

  const scrollToRelevant: Action<HTMLElement, Array<{ date: Date }>> = (
    node,
    events,
  ) => {
    const update = ([first]: typeof events) => {
      let top = toRems(new Temporal.PlainTime(7, 30)) * 16;
      if (first)
        top = Math.max(top, toRems(fixDate(first.date).toPlainTime()) * 16);
      node.scrollTo({ top });
    };
    update(events);
    return { update };
  };
</script>

<main>
  <section>
    <h2>{m.latest_events()}</h2>
    <div class="scroll _stack-2" style="padding: .5rem">
      {#each latest as { author, body, date, createdAt }}
        <article style="background: #e8faef">
          <header>
            <h3><a href="/@{author.username}">@{author.username}</a></h3>
            <p style="font-size: .75em">{format(createdAt)}</p>
          </header>
          <p>{body}</p>
          <footer>
            <Calendar />
            {format(date)}
          </footer>
        </article>
      {/each}
    </div>
  </section>
  {#each Object.entries(windows) as [day, events], i}
    <section>
      <h2 class="_row-2">
        {#if i === 0}
          <a href="/{start.subtract({ days: 1 }).toString()}">
            <CaretLeft />
          </a>
        {/if}
        <span style="flex: 1">{formatDay(day)}</span>
        {#if i === 2}
          <a href="/{start.add({ days: 1 }).toString()}">
            <CaretRight />
          </a>
        {/if}
      </h2>
      <div class="scroll" use:scrollToRelevant={events}>
        <div class="day">
          {#each Array.from({ length: 23 }, (_, i) => i + 1) as hour}
            <div>
              <span>
                {Temporal.PlainTime.from({ hour }).toLocaleString(
                  data.language,
                  { hour: "numeric", minute: "numeric" },
                )}
              </span>
            </div>
          {/each}
          <div style="border: 0" />
          {#if i === 0}
            <hr style:top="{toRems(time)}rem" />
          {/if}
          {#each events as { author, body, date }}
            <article
              style="background: #dcfaff"
              style:top="{toRems(fixDate(date).toPlainTime())}rem"
            >
              @{author.username}<br />
              {body}<br />
              {fixDate(date).toLocaleString(data.language, {
                hour: "numeric",
                minute: "numeric",
              })}
            </article>
          {/each}
        </div>
      </div>
    </section>
  {/each}
</main>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 1px;
    min-height: 0;

    > * {
      min-height: 0;
    }
  }

  section {
    background: #fff;
    border-top-right-radius: 0.25rem;
    display: flex;
    flex-direction: column;
    contain: strict;

    + section {
      border-top-left-radius: 0.25rem;
    }

    > * {
      margin: 0;
    }

    h2 {
      padding: 0.5rem;
      box-shadow: 0 0 0.5rem #19191a10;
      z-index: 1;
    }
  }

  article {
    padding: 0.5rem;
    border-radius: 0.25rem;

    > * {
      margin: 0;
    }

    > header {
      display: flex;
      gap: 0.5rem;
      align-items: baseline;

      > * {
        margin: 0;
      }
    }
  }

  .scroll {
    overflow-y: scroll;
  }

  .day {
    contain: content;

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

  ._row-2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    > * {
      margin: 0;
    }
  }

  ._stack-2 {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    > * {
      margin: 0;
    }
  }
</style>
