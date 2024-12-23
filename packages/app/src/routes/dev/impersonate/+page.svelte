<script lang="ts">
  import { enhance } from "$app/forms";
  import { reportValidity } from "formgator/sveltekit";
  import { Button, Select } from "uistiti";

  const { data } = $props();
</script>

<form method="POST" use:enhance={reportValidity}>
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
  <p>
    <Button type="submit">Impersonate</Button>
  </p>
</form>
