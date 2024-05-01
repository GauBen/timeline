<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { format, m } from "$lib/i18n.js";
  import { resolveRoute } from "$lib/paths.js";
  import type { Event, User } from "@prisma/client";
  import type { Snippet } from "svelte";
  import Calendar from "~icons/ph/calendar-dot-duotone";
  import CalendarDots from "~icons/ph/calendar-dots-duotone";
  import ClockClockwise from "~icons/ph/clock-clockwise-duotone";
  import Globe from "~icons/ph/globe-duotone";

  const {
    children,
    header,
    latest,
  }: {
    children: Snippet;
    header: Snippet;
    latest: Array<Event & { author: User }>;
  } = $props();
</script>

<div class="layout">
  <header>
    {@render header()}
  </header>

  <main>
    <section id="recent">
      <h2>{m.latest_events()}</h2>
      <div class="scroll _stack-2" style="padding: .5rem">
        {#each latest as { id, author, body, date, public: pub, createdAt }}
          <article style="background: #e8faef">
            <header>
              <h3>
                <a href={$resolveRoute({ username: author.username })}>
                  @{author.username}
                </a>
              </h3>
              <p style="font-size: .75em">
                {#if pub}
                  <Globe />
                {/if}
                <a href="?event={id}">{$format(createdAt)}</a>
              </p>
            </header>
            <p>{body}</p>
            <footer>
              <Calendar />
              {$format(date)}
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
      aria-current={browser && $page.url.hash !== "#calendar"
        ? "page"
        : undefined}
    >
      <ClockClockwise /> Recent</a
    >
    <a
      href="#calendar"
      aria-current={$page.url.hash === "#calendar" ? "page" : undefined}
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
