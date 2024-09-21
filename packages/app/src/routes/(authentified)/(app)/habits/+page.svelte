<script>
  import { enhance } from "$app/forms";

  const { data } = $props();
</script>

<a href="/">back</a>

<h1>Habit tracker</h1>

<form method="post" action="?/remove" id="remove"></form>

{#if data.habits.length === 0}
  <p>No habits yet.</p>
{:else}
  <ul>
    {#each data.habits as habit}
      <li>
        {habit.name}
        <button
          type="submit"
          form="remove"
          name="id"
          value={habit.id.toString()}
        >
          Remove
        </button>
      </li>
    {/each}
  </ul>
{/if}

<h2>New habit</h2>

<form method="post" action="?/create" use:enhance>
  <label>
    Name:
    <input type="text" name="name" required maxlength="255" />
  </label>
  <button type="submit">Add</button>
</form>
