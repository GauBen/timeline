<script lang="ts">
  import { enhance } from "$app/forms";
  import { Temporal, toTemporalInstant } from "@js-temporal/polyfill";
  import { Button } from "uistiti";
  import Calendar from "~icons/ph/calendar-dot-duotone";
  import Globe from "~icons/ph/globe-duotone";
  import { language } from "$lib/i18n.js";
  import CaretLeft from "~icons/ph/caret-left";

  const { data } = $props();
  const { year, user, followed } = $derived(data);

  const mosaic = $derived(
    new Map(
      data.mosaic.map(({ date, count }) => [
        toTemporalInstant
          .call(date)
          .toZonedDateTime({ calendar: "iso8601", timeZone: "Europe/Paris" })
          .toPlainDate()
          .toString(),
        count,
      ]),
    ),
  );
  const max = $derived(Math.max(...mosaic.values()));

  const firstDayOfYear = $derived(
    Temporal.PlainDate.from({ year, month: 1, day: 1 }),
  );
  const start = $derived(
    firstDayOfYear.subtract({ days: firstDayOfYear.dayOfWeek - 1 }),
  );
</script>

<div class="layout">
  <header>
    <h1>
      <a href="/" style="text-decoration: unset"><CaretLeft /></a>
      <span
        style="display: inline-block; width: 2rem; height: 2rem; background: purple; border-radius: 1rem"
      ></span>
      {user.displayName}
    </h1>
    <form method="POST" use:enhance>
      {#if followed}
        <Button color="danger" formaction="?/unfollow">Unfollow</Button>
      {:else}
        <Button formaction="?/follow">Follow</Button>
      {/if}
    </form>
  </header>

  <main class="scroll">
    <table>
      <tbody>
        <tr>
          <td></td>
          <!-- TODO: un-curse these date computations -->
          {#each Array.from({ length: 53 }) as _, week}
            {@const date = start.add({ weeks: week })}
            {#if date.year === year}
              {#if date.day <= 7}
                {@const nextMonth = date
                  .add({ months: 1 })
                  .toPlainYearMonth()
                  .toPlainDate({ day: 1 })}
                <td
                  colspan={date
                    .until(nextMonth, {
                      smallestUnit: "week",
                      roundingIncrement: 1,
                      roundingMode: "ceil",
                    })
                    .total({ unit: "week", relativeTo: date })}
                >
                  {date.toLocaleString($language, { month: "short" })}
                </td>
              {/if}
            {:else}
              <td></td>
            {/if}
          {/each}
        </tr>
        {#each ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as name, day}
          <tr>
            <td>{name}</td>
            {#each Array.from({ length: 53 }) as _, week}
              {@const date = start.add({ weeks: week, days: day })}
              {@const count = mosaic.get(date.toString())}
              <td
                title={date.toString()}
                style:background={count === undefined
                  ? date.month % 2
                    ? "#fff"
                    : "#cce"
                  : `rgb(30% 80% 40% / ${count / max})`}
              >
                {#if count !== undefined}
                  {count}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>

    {#each user.events as { body, date, public: pub, createdAt }}
      <article style="background: #e8faef">
        <header>
          <h3><a href="/{user.username}">@{user.username}</a></h3>
          <p style="font-size: .75em">
            {#if pub}
              <Globe />
            {/if}
            {createdAt}
          </p>
        </header>
        <p>{body}</p>
        <footer>
          <Calendar />
          {date}
        </footer>
      </article>
    {/each}
  </main>
</div>

<style lang="scss">
  .layout {
    height: 100dvh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: #19191a10;
    gap: 1px;
  }

  .layout > header {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: 0.5rem;
    background: #fff;
    align-items: center;

    > * {
      margin: 0;
    }
  }

  main {
    padding: 0.5rem;
    background: #fff;
  }

  form {
    display: flex;
    align-items: center;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    td {
      border: 1px solid #000;
      height: 1rem;
      width: 1rem;
      line-height: 1;
    }
  }

  .scroll {
    overflow-y: scroll;
  }
</style>
