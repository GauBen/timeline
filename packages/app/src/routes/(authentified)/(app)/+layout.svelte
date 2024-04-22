<script lang="ts">
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import CalendarDots from "~icons/ph/calendar-dots-duotone";
  import ClockClockwise from "~icons/ph/clock-clockwise-duotone";

  const { children, data } = $props();
</script>

<div class="layout">
  <header>
    <h1>Timeline</h1>
    <div>
      <select
        value={data.language}
        onchange={({ currentTarget }) => {
          document.cookie = `language=${currentTarget.value}; path=/; max-age=31536000`;
          location.reload();
        }}
      >
        <option value="en-US">English</option>
        <option value="fr-FR">Français</option>
      </select>
      <a href="/auth/logout" rel="external">Logout</a>
    </div>
  </header>

  {@render children()}

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
  header {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: 0.5rem;
    background: #fff;
    align-items: center;

    > * {
      margin: 0;
    }
  }

  .layout {
    height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr auto;
    background: #19191a10;
    gap: 1px;
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
