<script lang="ts">
  import { enhance } from "$app/forms";
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";

  const { form } = $props();

  let timezone = $state.raw(Intl.DateTimeFormat().resolvedOptions().timeZone);

  let username = $state(form?.accepted.username ?? "");
  let displayName = $state(form?.accepted.displayName ?? "");
</script>

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
        pattern={"[a-zA-Z][a-zA-Z0-9_]{2,19}"}
      />
    </label>
    {form?.issues.username?.message}
  </p>
  <p>
    <label>
      <span>Display name</span>
      <input
        required
        type="text"
        maxlength="255"
        name="displayName"
        bind:value={displayName}
      />
      {form?.issues.displayName?.message}
    </label>
  </p>
  <p>
    Time zone
    <TimezonePicker bind:timezone />
    <input type="hidden" name="timezone" value={timezone} />
    {form?.issues.timezone?.message}
  </p>
  <p>
    <button type="submit">Yay!</button>
  </p>
</form>
