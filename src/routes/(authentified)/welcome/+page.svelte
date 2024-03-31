<script lang="ts">
  import { enhance } from "$app/forms";

  export let form;
</script>

{#if form}
  {form.error}
{/if}

<h1>Welcome!</h1>
<form method="POST" action="" use:enhance>
  <h2>Complete your registration</h2>
  <p>
    <label>
      <span>Username</span>
      <input type="text" name="username" required />
    </label>
  </p>
  <p>
    <label>
      <span>Display name</span>
      <input type="text" name="display_name" required />
    </label>
  </p>
  <p>
    <button type="submit">Yay!</button>
  </p>
</form>
