<script lang="ts">
  export let data;

  $: ({ supabase, session, users } = data);
</script>

<h1>Users:</h1>

<ul>
  {#each users as user}
    <li>{user.email}</li>
  {/each}
</ul>

<pre>{JSON.stringify(session, null, 2)}</pre>

<button
  on:click={() => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL("/auth/callback", location.href).href },
    });
  }}
>
  Login with Google
</button>

<button
  on:click={() => {
    supabase.auth.signOut();
  }}
>
  Sign out
</button>
