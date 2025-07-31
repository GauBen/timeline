<script lang="ts">
  import { browser } from "$app/environment";
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import i18n from "$lib/i18n.svelte.js";
  import paths from "$lib/paths.svelte.js";
  import type { Event } from "$lib/types.js";
  import type { User } from "db";
  import { m } from "messages";
  import type { Snippet } from "svelte";
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
      <div class="scroll _stack-2" style="flex: 1; padding: .5rem">
        {#each latest as event (event.id)}
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
                  <span class="i-ph-globe-duotone"></span>
                {/if}
                <a href="?event={event.id}">{i18n.format(event.createdAt)}</a>
              </p>
            </header>
            <p>{event.body}</p>
            <footer>
              <span class="i-ph-calendar-dot-duotone"></span>
              {i18n.format(event.start)}
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
      <span class="i-ph-clock-clockwise"></span>
      {m.true_jumpy_tadpole_hush()}</a
    >
    <a
      href="#calendar"
      aria-current={page.url.hash === "#calendar" ? "page" : undefined}
    >
      <span class="i-ph-calendar-dots-duotone"></span>
      {m.weird_large_nuthatch_fall()}</a
    >
  </nav>
</div>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: 100vw 100vw;
    gap: 1px;
    min-height: 0;
    overflow: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;

    @media (width > 40rem) {
      grid-template-columns: 20rem 1fr;
    }

    > * {
      min-height: 0;
    }
  }

  section {
    display: flex;
    flex-direction: column;
    contain: strict;
    scroll-snap-align: start;
    background: #fff;

    h2 {
      z-index: 1;
      padding: 0.5rem;
      box-shadow: 0 0 0.5rem #19191a10;
    }
  }

  article {
    padding: 0.5rem;
    border: 2px solid #e8faef;
    border-radius: 0.25rem;

    > header {
      display: flex;
      gap: 0.5rem;
      align-items: baseline;
    }

    &.added {
      background: #e8faef;
    }
  }

  .layout {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 1px;
    height: 100dvh;
    background: #19191a10;
  }

  .layout > header {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    background: #fff;
  }

  .scroll {
    overflow-y: scroll;
  }

  .calendar {
    grid-column: 2 / -1;
    contain: paint;
    scroll-snap-align: start;
  }

  nav {
    display: flex;
    justify-content: space-evenly;
    padding: 0.25rem;
    background-color: #fff;

    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.25rem 1rem;
      font-size: 0.75rem;
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
