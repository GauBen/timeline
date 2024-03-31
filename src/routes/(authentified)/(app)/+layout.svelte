<script lang="ts">
  const { children } = $props();
</script>

<nav>
  <a href="/">Latest</a>
  <a href="/">Today</a>
  <a href="/auth/logout" data-sveltekit-reload>Logout</a>
</nav>

{@render children()}
