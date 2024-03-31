<script lang="ts">
  import { Temporal } from "@js-temporal/polyfill";
  const { children } = $props();

  const today = Temporal.Now.plainDateISO();
  const yesterday = today.subtract({ days: 1 });
  const tomorrow = today.add({ days: 1 });
</script>

<nav>
  <a href="/">Latest</a>
  <a href="/{yesterday.toString().replaceAll('-', '/')}"> Yesterday </a>
  <a href="/{today.toString().replaceAll('-', '/')}"> Today </a>
  <a href="/{tomorrow.toString().replaceAll('-', '/')}"> Tomorrow </a>
  <a href="/auth/logout" data-sveltekit-reload>Logout</a>
</nav>

{@render children()}
