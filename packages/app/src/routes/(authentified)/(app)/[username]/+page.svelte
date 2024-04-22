<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button } from "uistiti";
  import Calendar from "~icons/ph/calendar-dot-duotone";
  import Globe from "~icons/ph/globe-duotone";

  const { data } = $props();
  const { user, followed } = $derived(data);
</script>

<main>
  <form method="POST" use:enhance>
    <h1>
      {user.displayName}
    </h1>
    {#if followed}
      <Button color="danger" formaction="?/unfollow">Unfollow</Button>
    {:else}
      <Button formaction="?/follow">Follow</Button>
    {/if}
  </form>

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

<style lang="scss">
  main {
    padding-inline: 0.5rem;
  }

  form {
    display: flex;
    align-items: center;
  }
</style>
