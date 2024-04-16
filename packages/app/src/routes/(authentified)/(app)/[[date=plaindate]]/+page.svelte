<script lang="ts">
  import { enhance } from "$app/forms";
  import { language, m } from "$lib/i18n.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button } from "uistiti";
  import Calendar from "~icons/ph/calendar-dot-duotone";
  import CaretLeft from "~icons/ph/caret-left-duotone";
  import CaretRight from "~icons/ph/caret-right-duotone";
  import Day, { cancel } from "./Day.svelte";

  const { data } = $props();
  const { latest, windows } = $derived(data);
  const today = Temporal.Now.plainDateISO("Europe/Paris");
  const start = $derived(Temporal.PlainDate.from(data.start));

  const formatDay = (day: string) => {
    if (day === today.subtract({ days: 1 }).toString()) return m.yesterday();
    else if (day === today.toString()) return m.today();
    else if (day === today.add({ days: 1 }).toString()) return m.tomorrow();

    return Temporal.PlainDate.from(day).toLocaleString($language, {
      month: "short",
      day: "numeric",
    });
  };

  const formatter = new Intl.RelativeTimeFormat($language, {
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

  let eventInCreation = $state<{ date: Temporal.PlainDateTime }>();
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
      <Day
        {events}
        today={day === today.toString()}
        oncreatestart={({ time }) => {
          eventInCreation = {
            date: Temporal.PlainDate.from(day).toPlainDateTime(time),
          };
        }}
        oncancel={() => {
          eventInCreation = undefined;
        }}
      />
    </section>
  {/each}
</main>

{#if eventInCreation}
  <dialog open>
    <form
      method="POST"
      action="?/createEvent"
      use:enhance={() =>
        async ({ update }) => {
          eventInCreation = undefined;
          cancel();
          return update();
        }}
    >
      <h2>Create a new event</h2>
      <p>
        <label>
          <span>Event</span>
          <input required type="text" maxlength="1024" name="body" />
        </label>
      </p>
      <p>
        <label>
          <span>Date</span>
          <!-- TODO: bind:value -->
          <input
            required
            type="datetime-local"
            name="date"
            value={eventInCreation.date.toString().slice(0, 16)}
          />
        </label>
      </p>
      <p>Visibility: Public (everyone can see it)</p>
      <p>
        <Button type="submit" color="success">Create</Button>
        <Button
          type="button"
          color="danger"
          variant="outline"
          onclick={() => {
            eventInCreation = undefined;
            cancel();
          }}>Cancel</Button
        >
      </p>
    </form>
  </dialog>
{/if}

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
