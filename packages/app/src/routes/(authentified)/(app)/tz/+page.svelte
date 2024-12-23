<script lang="ts">
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";
  import { Temporal } from "@js-temporal/polyfill";

  let timezone = $state("Europe/London");
  let now = $state(Temporal.Now.instant());

  let wallTime = $derived.by(() =>
    now
      .toZonedDateTimeISO(timezone)
      .toPlainTime()
      .toString({ smallestUnit: "second" }),
  );

  // Set the timezone on load
  $effect(() => {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  // Update `wallTime` every second
  $effect(() => {
    const interval = setInterval(() => {
      now = Temporal.Now.instant();
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<TimezonePicker bind:timezone />

{#if wallTime}
  Current time: {wallTime}
{/if}
