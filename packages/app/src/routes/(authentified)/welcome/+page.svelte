<script lang="ts">
  import { enhance } from "$app/forms";
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";
  import i18n from "$lib/i18n.svelte.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { reportValidity } from "formgator/sveltekit";
  import { humanId } from "human-id";
  import * as m from "messages";
  import { getLocale } from "messages/runtime";
  import { Button, Input, Select } from "uistiti";

  const dice = [
    "i-ph-dice-one-duotone",
    "i-ph-dice-two-duotone",
    "i-ph-dice-three-duotone",
    "i-ph-dice-four-duotone",
    "i-ph-dice-five-duotone",
    "i-ph-dice-six-duotone",
  ];
  let die = $state(dice[5]);
  const cast = () => (die = dice[Math.trunc(Math.random() * 6)]);

  const { form, data } = $props();

  let username = $state(form?.accepted.username ?? "");
  let displayName = $state(form?.accepted.displayName ?? "");

  let timezone = $state.raw(Intl.DateTimeFormat().resolvedOptions().timeZone);
  let now = $state.raw(Temporal.Now.instant());
  let wallTime = $derived.by(() =>
    now
      .toZonedDateTimeISO(timezone)
      .toPlainTime()
      .toLocaleString([data.locale, getLocale()]),
  );

  // Update `wallTime` every second
  $effect(() => {
    const interval = setInterval(() => {
      now = Temporal.Now.instant();
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<main
  style="margin-inline: auto; padding: 1rem; max-width: 40rem"
  class="_stack-8"
>
  <header style="contain: paint">
    <h1 style="font-size: 4em">{m.lower_super_gopher_flow()}</h1>
    <p>
      {m.sweet_next_lizard_zoom()}
      <a href="https://github.com/GauBen/timeline">
        {m.warm_smart_maggot_accept()}
      </a>
    </p>
  </header>
  <form
    method="POST"
    action=""
    use:enhance={() => reportValidity()}
    class="_stack-2"
  >
    <h2>{m.direct_legal_giraffe_empower()}</h2>
    <p>
      <label class="label">
        <span>
          <span class="i-ph-translate-duotone"></span>
          {m.cuddly_weird_reindeer_express()}
        </span>
        <Select
          required
          name="locale"
          style="flex: 1"
          value={i18n.locale}
          onchange={({ currentTarget }) => {
            document.cookie = `locale=${currentTarget.value}; path=/; max-age=31536000`;
            location.reload();
          }}
        >
          <option value="en-US">English</option>
          <option value="fr-FR">Français</option>
        </Select>
      </label>
    </p>
    <p>
      <label class="label">
        <span>{m.tame_north_sheep_zap()}</span>
        <span class="_stack-1" style="flex: 1">
          <Input type="text" value={data.email} readonly style="width: 100%" />
          <small>{m.patient_next_thrush_soar()}</small>
        </span>
      </label>
    </p>
    <p>
      <label class="label">
        <span>{m.muddy_jolly_swan_heal()}</span>
        <span class="_stack-1" style="flex: 1">
          <span class="_row-1">
            <Input
              required
              type="text"
              maxlength={20}
              name="username"
              style="flex: 1"
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
              <span class={die}>Random</span>
            </Button>
          </span>
          <small>{m.equal_elegant_iguana_stir()}</small>
        </span>
      </label>
    </p>
    <p>
      <label class="label">
        <span>{m.misty_keen_bobcat_skip()}</span>
        <span class="_stack-1" style="flex: 1">
          <Input
            required
            type="text"
            maxlength={255}
            name="displayName"
            style="width: 100%"
            bind:value={displayName}
          />
          <small>{m.quick_heroic_fox_mix()}</small>
        </span>
      </label>
    </p>
    <p class="label">
      <span>{m.day_north_ape_blink()}</span>
      <TimezonePicker bind:timezone />
      <input type="hidden" name="timezone" value={timezone} />
      {m.elegant_misty_shad_stop({ wallTime })}
    </p>
    <p>
      {m.tense_loved_jan_thrive()}
    </p>
    <p>
      <Button type="submit" color="success" style="width: 100%; font-size: 3em">
        {m.early_dark_bobcat_hack()}
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
