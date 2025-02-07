<script lang="ts">
  import { enhance } from "$app/forms";
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";
  import { Temporal } from "@js-temporal/polyfill";
  import type { Follow, Tag, User } from "@prisma/client";
  import { reportValidity } from "formgator/sveltekit";
  import { untrack } from "svelte";
  import { Button, Card, Input, Select } from "uistiti";

  let {
    tags,
    timezone,
    followings,
    toggleEventCreation,
    getEventInCreationElement,
    eventInCreation,
  }: {
    tags: Tag[];
    timezone: string;
    followings: Array<Follow & { following: User }>;
    toggleEventCreation: (
      datetime?: Temporal.PlainDateTime | undefined,
    ) => Promise<void>;
    getEventInCreationElement?: () => HTMLElement | undefined;
    eventInCreation: Temporal.PlainDateTime;
  } = $props();

  let mousedown = $state(false);
  let x = $state(0);
  let y = $state(0);
  let dialog = $state<HTMLDialogElement>();

  const moveDialog = (
    { movementX, movementY }: { movementX: number; movementY: number },
    { left, right, top, bottom }: DOMRect,
  ) => {
    // Move the dialog within the screen
    if (left + movementX < 0) x -= left;
    else if (right + movementX > window.innerWidth)
      x -= right - window.innerWidth;
    else x += movementX;

    if (top + movementY < 0) y -= top;
    else if (bottom + movementY > window.innerHeight)
      y -= bottom - window.innerHeight;
    else y += movementY;
  };

  $effect(() => {
    const target = getEventInCreationElement?.()?.getBoundingClientRect();
    if (!target) return;
    const source = dialog!.getBoundingClientRect();
    untrack(() => {
      // TODO: use floating-ui to position the dialog
      const movementX = target.x - source.x - source.width - 8;
      const movementY =
        target.y - source.y - source.height / 2 + target.height / 2;
      moveDialog({ movementX, movementY }, source);
    });
  });

  let pub = $state("on");
</script>

<svelte:document
  onmouseup={() => {
    mousedown = false;
  }}
  onmousemove={(event) => {
    if (mousedown && dialog) {
      moveDialog(event, dialog.getBoundingClientRect());
    }
  }}
/>

<dialog
  open
  style:transform="translate({x}px, {y}px)"
  style:transition={mousedown ? "none" : undefined}
  bind:this={dialog}
>
  <Card
    headerProps={{
      style: "cursor: move; user-select: none",
      onmousedown: () => (mousedown = true),
    }}
  >
    {#snippet header()}
      Create a new event
    {/snippet}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <form
      use:enhance={() => reportValidity()}
      method="POST"
      action="?/createEvent"
      class="_stack-2"
      style="width: 30rem; max-width: 100%"
      onkeydown={(event) => {
        if (event.key === "Escape") toggleEventCreation();
        event.stopPropagation();
      }}
    >
      <p>
        <label class="label">
          <span>Event</span>
          <Input
            type="text"
            name="body"
            required
            maxlength={1024}
            style="width: 100%"
          />
        </label>
      </p>
      <p>
        <label class="label">
          <span>Date</span>
          <Input
            type="datetime-local"
            name="date"
            required
            style="width: 100%"
            value={eventInCreation.toString().slice(0, 16)}
            oninput={async ({ currentTarget }) => {
              try {
                toggleEventCreation(
                  Temporal.PlainDateTime.from(currentTarget.value),
                );
              } catch {
                // Ignore invalid dates
              }
            }}
          />
        </label>
      </p>
      <p class="label">
        <span>Timezone</span>
        <TimezonePicker bind:timezone />
        <input type="hidden" name="startTimezone" value={timezone} />
      </p>
      <p class="label">
        <span>Visibility</span>
        <span class="_stack-2" style="flex: 1">
          <label class="_row-2">
            <input type="radio" name="public" value="on" bind:group={pub} /> Public
          </label>
          <label class="_row-2">
            <input type="radio" name="public" bind:group={pub} />
            Only with specific people
          </label>
          <Select
            multiple
            disabled={Boolean(pub)}
            name="shared_with"
            style="width: 100%"
          >
            {#each followings as { following }}
              <option value={following.id}>{following.displayName}</option>
            {/each}
          </Select>
        </span>
      </p>
      <p class="label">
        <span>Tags</span>
        <span class="_row-2" style="flex: 1">
          {#each tags as tag}
            <label class="tag" style:--color="#{tag.color}">
              <input type="checkbox" name="tags" value={tag.id} />
              {tag.name}
            </label>
          {/each}
        </span>
      </p>
      <p style="display: flex; justify-content: end; gap: .5em">
        <Button
          variant="ghost"
          onclick={() => toggleEventCreation()}
          type="button"
        >
          Cancel
        </Button>
        <Button color="success">Create</Button>
      </p>
    </form>
  </Card>
</dialog>

<style lang="scss">
  dialog {
    z-index: 100;
    padding: 0;
    border: 0;
    background: none;
    max-width: 100%;
    transition: transform 0.2s;
  }

  .label {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    > :first-child {
      font-weight: bold;
      min-width: 5em;
      text-align: right;
      user-select: none;
    }
  }

  .tag {
    padding: 0.5em;
    border-radius: 0.25em;
    color: #000;
    text-shadow: 0 0 0.5rem #fff;
    border: 2px solid var(--color);
    cursor: pointer;
    border-radius: 0.5;

    input {
      display: none;
    }

    &:has(:checked) {
      background-color: var(--color);
    }
  }
</style>
