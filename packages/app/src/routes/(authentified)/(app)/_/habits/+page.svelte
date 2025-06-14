<script>
  import { enhance } from "$app/forms";
  import { reportValidity } from "formgator/sveltekit";
  import { Button, Input } from "uistiti";

  const { data } = $props();
</script>

{#if data.habits.length === 0}
  <p>No habits yet.</p>
{:else}
  <form method="post" action="?/remove" id="remove" use:enhance>
    <ul>
      {#each data.habits as habit (habit.id)}
        <li>
          {habit.name}
          <button type="submit" name="id" value={habit.id.toString()}>
            Remove
          </button>
        </li>
      {/each}
    </ul>
  </form>
{/if}

<h2>New habit</h2>

<form method="post" action="?/create" use:enhance={() => reportValidity()}>
  <label>
    Name:
    <Input type="text" name="name" required maxlength={255} />
  </label>
  <Button type="submit">Add</Button>
</form>
