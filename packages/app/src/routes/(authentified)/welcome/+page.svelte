<script lang="ts">
  import { enhance } from "$app/forms";

  export let form;

  let username = form?.input?.username ?? "";
  let displayName = form?.input?.displayName ?? "";
</script>

{#if form}
  {form.error}
{/if}

<h1>Welcome!</h1>
<form method="POST" action="" use:enhance>
  <h2>Complete your registration</h2>
  <p>
    <label>
      <span>
        Username (Letters, digits or _, 3 to 20 characters, must start with a
        letter)
      </span>
      <input
        required
        type="text"
        maxlength="20"
        name="username"
        bind:value={username}
        pattern={"[a-zA-Z0-9_]{3,20}"}
      />
    </label>
    {(form?.validationErrors?.fieldErrors?.username ?? []).join(", ")}
  </p>
  <p>
    <label>
      <span>Display name</span>
      <input
        required
        type="text"
        maxlength="255"
        name="display_name"
        bind:value={displayName}
      />
      {(form?.validationErrors?.fieldErrors?.displayName ?? []).join(", ")}
    </label>
  </p>
  <p>
    <button type="submit">Yay!</button>
  </p>
</form>
