<script lang="ts">
  const { data } = $props();
</script>

<main class="_stack-4">
  <h1>Timeline</h1>
  <p>The social calendar</p>
  <p>
    <a href="/auth/google" rel="external">Sign in with google</a>
    {#if data.devMode}
      <a href="/dev/impersonate" rel="external">Impersonate</a>
    {/if}
  </p>
  <h2>What is Timeline?</h2>
  <p>
    Timeline allows people to share what they did and what they plan to do,
    using
    <em>Events</em>. Share your holiday photos with your family, plan vacations
    with your friends, follow your favorite band's tour, or just share your
    daily life with your followers. It's up to you!
  </p>
  <h2>Why?</h2>
  <p>
    Sharing events with people happens all the time, yet there is still no
    enjoyable way to do it. Either you share a cloud calendar with them, and you
    need one per group of people you share things with, or you invite them by
    email for all events, which is a terribly cumbersome.
  </p>
  <p>Timeline is the missing social calendar.</p>
  <footer style="font-size: .8em; text-align: center">
    <p>
      ⚠️ Timeline is in not production ready. Please don't use it for anything
      important. ⚠️
    </p>
  </footer>
</main>

<style lang="scss">
  main {
    max-width: 60rem;
    padding-inline: 1rem;
    margin: 2rem auto;
  }
</style>
