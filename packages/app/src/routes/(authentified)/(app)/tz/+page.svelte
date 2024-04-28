<script lang="ts">
  import { Temporal } from "@js-temporal/polyfill";

  const { data } = $props();
  const { timezones } = $derived(data);

  const supportedTimezones = new Set(Intl.supportedValuesOf("timeZone"));

  const commonTimezones = $derived(
    timezones
      .filter((tz) => supportedTimezones.has(tz))
      .reduce(
        (acc, tz) => {
          const [area, ...location] = tz.split("/");
          return { ...acc, [area]: [...(acc[area] ?? []), location.join("/")] };
        },
        {} as Record<string, string[]>,
      ),
  );

  let area = $state<string>();
  let location = $state<string>();
  let now = $state<Temporal.Instant>(Temporal.Now.instant());

  let wallTime = $derived.by(() => {
    if (!area || !location) return;
    return now
      .toZonedDateTimeISO(area + "/" + location)
      .toPlainTime()
      .toString({ smallestUnit: "second" });
  });

  // Try to set area and location on load
  $effect(() => {
    const [userArea, ...userLocation] = Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone.split("/");
    if (commonTimezones[userArea]?.includes(userLocation.join("/"))) {
      area = userArea;
      location = userLocation.join("/");
    }
  });

  // Update `wallTime` every second
  $effect(() => {
    const interval = setInterval(() => {
      now = Temporal.Now.instant();
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

<select
  bind:value={area}
  onchange={() => {
    if (area) location = commonTimezones[area][0];
  }}
>
  {#each Object.keys(commonTimezones) as area}
    <option value={area}>{area}</option>
  {/each}
</select>

{#if area}
  <select bind:value={location}>
    {#each commonTimezones[area] as location}
      <option value={location}>{location.replaceAll("_", " ")}</option>
    {/each}
  </select>
{/if}

{#if wallTime}
  Current time: {wallTime}
{/if}
