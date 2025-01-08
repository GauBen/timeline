<script lang="ts">
  import { enhance } from "$app/forms";
  import { reportValidity } from "formgator/sveltekit";
  import { Button, Input, Select } from "uistiti";

  const { data } = $props();
</script>

<form
  action="?/login"
  method="POST"
  class="_stack-2"
  use:enhance={() => reportValidity()}
>
  <h2>Impersonate</h2>
  <p class="_row-2">
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
    <Button type="submit" variant="outline">Impersonate</Button>
  </p>
</form>

<hr style="width: 100%" />

<form
  action="?/register"
  method="POST"
  class="_stack-2"
  use:enhance={() => reportValidity()}
>
  <h2>Create an account</h2>
  <p class="_row-2">
    <label>
      Email:
      <Input type="email" name="email" required />
    </label>
    <Button type="submit" variant="outline">Create</Button>
  </p>
</form>
