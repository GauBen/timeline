<script lang="ts">
  import { enhance } from "$app/forms";

  const { data } = $props();
</script>

<form method="POST" use:enhance>
  <h1>Impersonate</h1>
  <p>
    <label>
      User:
      <select name="id">
        {#each data.users as { id, email, user }}
          <option value={id}>
            {email} ({user ? user.username : "no account"})
          </option>
        {/each}
      </select>
    </label>
  </p>
  <p>
    <button type="submit">Impersonate</button>
  </p>
</form>
