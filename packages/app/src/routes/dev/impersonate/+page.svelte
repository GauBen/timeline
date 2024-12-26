<script lang="ts">
  import { enhance } from "$app/forms";
  import { reportValidity } from "formgator/sveltekit";
  import { Button, Select } from "uistiti";

  const { data } = $props();
</script>

<form method="POST" class="_stack-2" use:enhance={() => reportValidity()}>
  <h1>Impersonate</h1>
  <p>
    <label>
      User:
      <Select name="id">
        {#each data.users as { id, email, user }}
          <option value={id}>
            {email} ({user?.username ?? "no account"})
          </option>
        {/each}
      </Select>
    </label>
  </p>
  <p class="_row-2">
    <Button type="submit" variant="outline">Impersonate</Button>
    <a href="http://localhost:54323/project/default/auth/users">
      Create new users
    </a>
  </p>
</form>
