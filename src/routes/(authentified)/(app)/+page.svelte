<script lang="ts">
  export let data;

  $: ({ session, users } = data);
</script>

<h1>Users:</h1>

<ul>
  {#each users as user}
    <li>{user.displayName} (@{user.username})</li>
  {/each}
</ul>

<pre>{JSON.stringify(session, null, 2)}</pre>

<a href="/auth/logout">Logout</a>
