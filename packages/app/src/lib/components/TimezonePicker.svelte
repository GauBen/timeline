<script lang="ts">
  import { page } from "$app/state";
  import { Select } from "uistiti";

  let { timezone = $bindable("Europe/London") }: { timezone: string } =
    $props();

  const supportedTimezones = new Set(Intl.supportedValuesOf("timeZone"));

  const commonTimezones = $derived(
    page.data.timezones
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

  const splitTimezone = () => {
    const [userArea, ...userLocation] = timezone.split("/");
    if (commonTimezones[userArea]?.includes(userLocation.join("/"))) {
      area = userArea;
      location = userLocation.join("/");
    }
  };

  splitTimezone();
  $effect(splitTimezone);
</script>

<Select
  bind:value={area}
  onchange={() => {
    if (area) {
      location = commonTimezones[area][0];
      timezone = `${area}/${location}`;
    }
  }}
>
  {#each Object.keys(commonTimezones) as value (value)}
    <option {value} selected={value === area}>{value}</option>
  {/each}
</Select>

{#if area}
  <Select
    bind:value={location}
    onchange={() => {
      if (location) timezone = `${area}/${location}`;
    }}
  >
    {#each commonTimezones[area] as value (value)}
      <option {value} selected={value === location}>
        {value.replaceAll("_", " ")}
      </option>
    {/each}
  </Select>
{/if}
