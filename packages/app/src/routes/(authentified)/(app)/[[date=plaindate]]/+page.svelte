<script lang="ts">
  import { enhance } from "$app/forms";
  import Layout from "$lib/Layout.svelte";
  import { language, m } from "$lib/i18n.js";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button } from "uistiti";
  import CaretLeft from "~icons/ph/caret-left-duotone";
  import CaretRight from "~icons/ph/caret-right-duotone";
  import Day from "./Day.svelte";

  const { data } = $props();
  const { latest, windows } = $derived(data);
  const today = Temporal.Now.plainDateISO("Europe/Paris");
  const start = $derived(Temporal.PlainDate.from(data.start));

  const formatDay = (day: Temporal.PlainDate) => {
    if (day.equals(today.subtract({ days: 1 }))) return m.yesterday();
    else if (day.equals(today)) return m.today();
    else if (day.equals(today.add({ days: 1 }))) return m.tomorrow();
    return day.toLocaleString($language, { month: "short", day: "numeric" });
  };

  let eventInCreation = $state<Temporal.PlainDateTime>();

  let calendarHeader = $state<HTMLElement>();
  let numberOfColumns = $state(1);

  const onresize = () => {
    if (!calendarHeader) return;
    numberOfColumns = window
      .getComputedStyle(calendarHeader)
      .gridTemplateColumns.split(" ").length;
  };

  $effect(onresize);
</script>

<svelte:window
  {onresize}
  onkeydown={({ key }) => {
    if (!eventInCreation) return;

    if (key === "Escape") eventInCreation = undefined;
    else if (key === "ArrowDown")
      eventInCreation = eventInCreation.add({ minutes: 15 });
    else if (key === "ArrowUp")
      eventInCreation = eventInCreation.subtract({ minutes: 15 });
    else if (key === "ArrowLeft")
      eventInCreation = eventInCreation.subtract({ days: 1 });
    else if (key === "ArrowRight")
      eventInCreation = eventInCreation.add({ days: 1 });
  }}
/>

{#if eventInCreation}
  <dialog open>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <form
      use:enhance
      method="POST"
      action="?/createEvent"
      onreset={() => {
        eventInCreation = undefined;
      }}
      onkeydown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") event.currentTarget.reset();
      }}
    >
      <h2>Create a new event</h2>
      <p>
        <label>
          <span>Event</span>
          <input required type="text" maxlength="1024" name="body" />
        </label>
      </p>
      <p>
        <label>
          <span>Date</span>
          <input
            required
            type="datetime-local"
            name="date"
            value={eventInCreation.toString().slice(0, 16)}
            oninput={({ currentTarget }) => {
              try {
                eventInCreation = Temporal.PlainDateTime.from(
                  currentTarget.value,
                );
              } catch {
                // Ignore invalid dates
              }
            }}
          />
        </label>
      </p>
      <p>
        Visibility:
        <label>
          <input type="radio" name="public" value="1" checked /> Public
        </label>
        <label>
          <input type="radio" name="public" value="" /> Private
        </label>
      </p>
      <p>
        <Button type="submit" color="success">Create</Button>
        <Button type="reset" color="danger" variant="outline">Cancel</Button>
      </p>
    </form>
  </dialog>
{/if}

<Layout {latest}>
  {#snippet header()}
    <h1><a href="/" style="text-decoration: unset">Timeline</a></h1>
    <div>
      <select
        value={data.language}
        onchange={({ currentTarget }) => {
          document.cookie = `language=${currentTarget.value}; path=/; max-age=31536000`;
          location.reload();
        }}
      >
        <option value="en-US">English</option>
        <option value="fr-FR">Français</option>
      </select>
      <a href="/auth/logout" rel="external">Logout</a>
    </div>
  {/snippet}

  <header bind:this={calendarHeader}>
    {#each Object.keys(windows) as key, i}
      {@const day = Temporal.PlainDate.from(key)}
      <h2 class="_row-2">
        {#if i === 0}
          <a href="/{start.subtract({ days: 1 }).toString()}">
            <CaretLeft />
          </a>
        {/if}
        <span style="flex: 1">{formatDay(day)}</span>
        {#if i === numberOfColumns - 1}
          <a
            href="/{start.add({ days: 1 }).toString()}"
            style="position: absolute; right: .5rem"
          >
            <CaretRight />
          </a>
        {/if}
      </h2>
    {/each}
  </header>
  <div class="scroll">
    {#each Object.entries(windows) as [key, events]}
      {@const day = Temporal.PlainDate.from(key)}
      <Day {events} {day} bind:eventInCreation />
    {/each}
  </div>
</Layout>

<style lang="scss">
  dialog {
    z-index: 100;
  }

  .scroll {
    overflow-y: scroll;
  }

  header {
    box-shadow: 0 0 0.5rem #19191a10;
    z-index: 1;

    h2 {
      background: #fff;
      display: flex;
      padding: 0.5rem;
      contain: paint;
    }

    > * {
      margin: 0;
    }
  }

  header,
  .scroll {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
    grid-template-rows: auto;
    grid-auto-rows: 0;
    contain: paint;
    column-gap: 1px;
  }

  .scroll {
    min-height: 0;

    > :global(*) {
      background: #fff;
    }
  }
</style>
