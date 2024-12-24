<script lang="ts">
  import { enhance } from "$app/forms";
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";
  import { reportValidity } from "formgator/sveltekit";
  import { Button, Input } from "uistiti";
  import Dice1 from "~icons/ph/dice-one-duotone";
  import Dice2 from "~icons/ph/dice-two-duotone";
  import Dice3 from "~icons/ph/dice-three-duotone";
  import Dice4 from "~icons/ph/dice-four-duotone";
  import Dice5 from "~icons/ph/dice-five-duotone";
  import Dice6 from "~icons/ph/dice-six-duotone";
  import { humanId } from "human-id";

  const dice = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  let Die = $state(Dice6);
  const cast = () => (Die = dice[Math.trunc(Math.random() * 6)]);

  const { form, data } = $props();

  let timezone = $state.raw(Intl.DateTimeFormat().resolvedOptions().timeZone);

  let username = $state(form?.accepted.username ?? "");
  let displayName = $state(form?.accepted.displayName ?? "");
</script>

<main
  style="margin-inline: auto; padding: 1rem; max-width: 40rem"
  class="_stack-8"
>
  <header>
    <h1 style="font-size: 4em">Welcome!</h1>
    <p>
      Thanks for joining Timeline so early in the development process! I hope
      you find it useful and convenient.
      <a href="https://github.com/GauBen/timeline">
        Share ideas and report bugs on GitHub.
      </a>
    </p>
  </header>
  <form method="POST" action="" use:enhance={reportValidity} class="_stack-2">
    <h2>Complete your registration</h2>
    <p>
      <label class="label">
        <span>Email</span>
        <span class="_stack-1" style="flex: 1">
          <Input
            type="text"
            value={data.session.email}
            readonly
            style="width: 100%"
          />
          <small>Just for reference, you can't change it</small>
        </span>
      </label>
    </p>
    <p>
      <label class="label">
        <span>Username</span>
        <span class="_stack-1" style="flex: 1">
          <span class="_row-1">
            <Input
              required
              type="text"
              maxlength={20}
              name="username"
              style="width: 100%"
              bind:value={username}
              pattern={"[a-zA-Z][a-zA-Z0-9_]{2,19}"}
            />
            <Button
              square
              variant="ghost"
              type="button"
              onmouseenter={cast}
              onmouseleave={cast}
              onclick={() => {
                username = humanId();
                cast();
              }}
            >
              <Die />
            </Button>
          </span>
          <small>
            • Letters, digits or _ • 3 to 20 characters • Must start with a
            letter
          </small>
        </span>
      </label>
    </p>
    <p>
      <label class="label">
        <span>Display name</span>
        <span class="_stack-1" style="flex: 1">
          <Input
            required
            type="text"
            maxlength={255}
            name="displayName"
            style="width: 100%"
            bind:value={displayName}
          />
          <small>Put as many emojis as you like ✨</small>
        </span>
      </label>
    </p>
    <p class="label">
      <span>Timezone</span>
      <TimezonePicker bind:timezone />
      <input type="hidden" name="timezone" value={timezone} />
    </p>
    <p>
      Last step is clicking this ginornous button. I made it big so you don't
      miss it :)
    </p>
    <p>
      <Button type="submit" color="success" style="width: 100%; font-size: 3em">
        Let's go!
      </Button>
    </p>
  </form>
</main>

<style>
  .label {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    > :first-child {
      font-weight: bold;
      min-width: 7em;
      text-align: right;
      user-select: none;
    }
  }
</style>
