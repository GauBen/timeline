<script lang="ts">
  import { enhance } from "$app/forms";
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";
  import i18n from "$lib/i18n.svelte.js";
  import { reportValidity } from "formgator/sveltekit";
  import { m } from "messages";
  import { getLocale } from "messages/runtime";
  import { tick } from "svelte";
  import { Select } from "uistiti";

  const { data } = $props();

  let timezone = $state.raw(data.me.timezone);
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

  let form: HTMLFormElement;
</script>

<form
  method="post"
  action=""
  use:enhance={() => reportValidity()}
  class="_stack-2"
  bind:this={form}
>
  <p>
    <label class="_row-2">
      <span class="i-ph-translate-duotone"></span>
      {m.cuddly_weird_reindeer_express()}
      <Select
        name="locale"
        value={i18n.locale}
        onchange={() => {
          form.requestSubmit();
        }}
      >
        <option value="en-US">English</option>
        <option value="fr-FR">Français</option>
      </Select>
    </label>
  </p>

  <p class="label">
    <span>{m.day_north_ape_blink()}</span>
    <TimezonePicker
      bind:timezone={
        () => timezone,
        (value) => {
          timezone = value;
          tick().then(() => form.requestSubmit());
        }
      }
    />
    <input type="hidden" name="timezone" value={timezone} />
    {m.elegant_misty_shad_stop({ wallTime })}
  </p>
</form>

<p>
  <a href="/auth/logout" rel="external">{m.dull_dizzy_salmon_ripple()}</a>
</p>
