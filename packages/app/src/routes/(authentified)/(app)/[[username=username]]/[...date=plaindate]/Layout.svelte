<script lang="ts">
  import { browser } from "$app/environment";
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import i18n, { m } from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { Event } from "$lib/types.js";
  import type { User } from "@prisma/client";
  import type { Snippet } from "svelte";
  import Calendar from "~icons/ph/calendar-dot-duotone";
  import CalendarDots from "~icons/ph/calendar-dots-duotone";
  import ClockClockwise from "~icons/ph/clock-clockwise-duotone";
  import Globe from "~icons/ph/globe-duotone";
  import EventActions from "./EventActions.svelte";

  const {
    me,
    children,
    header,
    latest,
  }: { me: User; children: Snippet; header: Snippet; latest: Event[] } =
    $props();
</script>

<div class="layout">
  <header>
    {@render header()}
  </header>

  <main>
    <section id="recent">
      <h2>{m.latest_events()}</h2>
      <div class="scroll _stack-2" style="padding: .5rem">
        {#each latest as event}
          <article class:added={event.added}>
            <header>
              <h3>
                <a
                  href={paths.resolveRoute({ username: event.author.username })}
                >
                  @{event.author.username}
                </a>
              </h3>
              <p style="font-size: .75em">
                {#if event.public}
                  <Globe />
                {/if}
                <a href="?event={event.id}">{i18n.format(event.createdAt)}</a>
              </p>
            </header>
            <p>{event.body}</p>
            <footer>
              <Calendar />
              {i18n.format(event.date)}
              <form method="POST" use:enhance>
                <EventActions {event} {me} />
              </form>
            </footer>
          </article>
        {/each}
      </div>
    </section>
    <div id="calendar" class="calendar">
      {@render children()}
    </div>
  </main>

  <nav>
    <a
      href="#recent"
      aria-current={browser && page.url.hash !== "#calendar"
        ? "page"
        : undefined}
    >
      <ClockClockwise /> Recent</a
    >
    <a
      href="#calendar"
      aria-current={page.url.hash === "#calendar" ? "page" : undefined}
    >
      <CalendarDots /> Calendar</a
    >
  </nav>
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
    grid-template-columns: 1fr auto auto;
    padding: 0.5rem;
    background: #fff;
    align-items: center;

    > :global(*) {
      margin: 0;
    }
  }

  main {
    display: grid;
    grid-template-columns: 100vw 100vw;
    overflow: hidden;
    gap: 1px;
    min-height: 0;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;

    @media (width > 40rem) {
      grid-template-columns: 20rem 1fr;
    }

    > * {
      min-height: 0;
    }
  }

  section {
    background: #fff;
    display: flex;
    flex-direction: column;
    contain: strict;
    scroll-snap-align: start;

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
    border: 2px solid #e8faef;

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

    &.added {
      background: #e8faef;
    }
  }

  .scroll {
    overflow-y: scroll;
  }

  .calendar {
    contain: paint;
    grid-column: 2 / -1;
    scroll-snap-align: start;
  }

  nav {
    display: flex;
    justify-content: space-evenly;
    background-color: #fff;
    padding: 0.25rem;

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 0.75rem;
      padding: 0.25rem 1rem;
      border-radius: 0.5rem;
      transition: background 0.5s;

      &[aria-current] {
        background: #19191a10;
      }
    }

    :global(svg) {
      width: 2rem;
      height: 2rem;
    }

    @media (width > 40rem) {
      display: none;
    }
  }
</style>
