<script lang="ts">
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";
  import { Temporal } from "@js-temporal/polyfill";

  let timezone = $state(Intl.DateTimeFormat().resolvedOptions().timeZone);
  let now = $state.raw(Temporal.Now.instant());

  let wallTime = $derived.by(() =>
    now
      .toZonedDateTimeISO(timezone)
      .toPlainTime()
      .toString({ smallestUnit: "second" }),
  );

  // Update `wallTime` every second
  $effect(() => {
    const interval = setInterval(() => {
      now = Temporal.Now.instant();
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<p>
  <TimezonePicker bind:timezone />

  Current time: {wallTime}
</p>
