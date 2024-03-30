<script lang="ts">
  export let data;

  $: ({ me, users } = data);
</script>

<h1>Users:</h1>

<ul>
  {#each users as user}
    <li>{user.email}</li>
  {/each}
</ul>

<pre>{JSON.stringify(me, null, 2)}</pre>

<a href="/auth/google">Sign in with google</a>
<a href="/auth/logout">Logout</a>
