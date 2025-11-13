<script lang="ts">
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";
  import {
    autoPlacement,
    autoUpdate,
    computePosition,
    offset,
    shift,
  } from "@floating-ui/dom";
  import type { Follow, Tag, User } from "db";
  import { fade } from "svelte/transition";
  import { Button, Card, Input, Select } from "uistiti";
  import { createEvent } from "./events.remote.js";

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
    getEventInCreationElement: () => HTMLElement | undefined;
    eventInCreation: Temporal.PlainDateTime;
  } = $props();

  let mousedown = $state(false);
  let animate = $state(false);
  let x = $state(0);
  let y = $state(0);
  let dialog: HTMLDialogElement;

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

  /** Disable the auto placement when the user moves the dialog manually. */
  let disableAutoPlacement = $state(false);

  /**
   * Keep track of the event in creation date, so that, if it changes, animate
   * the dialog movement.
   */
  let previous = eventInCreation;

  $effect(() => {
    if (disableAutoPlacement) return;

    const target = getEventInCreationElement();
    if (!target) return;

    if (previous !== eventInCreation) animate = true;
    previous = eventInCreation;

    return autoUpdate(target, dialog, () =>
      computePosition(target, dialog, {
        placement: "bottom",
        middleware: [
          offset(8),
          autoPlacement(),
          shift({ padding: 8, crossAxis: true }),
        ],
      }).then((position) => {
        x = position.x;
        y = position.y;
      }),
    );
  });

  $effect(() => {
    createEvent.fields.start.set(eventInCreation.toString().slice(0, 16));
  });

  $effect(() => {
    createEvent.fields.shared.set("public");
  });
</script>

<svelte:document
  onmouseup={() => (mousedown = false)}
  onmousemove={(event) => {
    if (mousedown && dialog) {
      moveDialog(event, dialog.getBoundingClientRect());
    }
  }}
/>

<dialog
  open
  style:transform="translate({x}px, {y}px)"
  style:transition={animate ? "transform 0.2s" : null}
  ontransitionend={() => (animate = false)}
  bind:this={dialog}
>
  <Card
    headerProps={{
      style: "cursor: move; user-select: none",
      onmousedown: () => {
        mousedown = true;
        disableAutoPlacement = true;
      },
    }}
  >
    {#snippet header()}
      <div style="flex: 1">Create a new event</div>
      {#if disableAutoPlacement}
        <div
          transition:fade={{ duration: 150 }}
          style="display: flex; font-size: .6667rem"
        >
          <Button
            square
            variant="soft"
            onmousedown={(event) => event.stopPropagation()}
            onclick={() => {
              animate = true;
              disableAutoPlacement = false;
            }}
          >
            <span class="i-ph-push-pin-slash-duotone">Unpin</span>
          </Button>
        </div>
      {/if}
    {/snippet}
    <form
      {...createEvent}
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
            {...createEvent.fields.body.as("text")}
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
            {...createEvent.fields.start.as("datetime-local")}
            required
            style="width: 100%"
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
        <input {...createEvent.fields.startTimezone.as("hidden", timezone)} />
      </p>
      <p class="label">
        <span>Visibility</span>
        <span class="_stack-2" style="flex: 1">
          <span
            style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5em"
          >
            <label class="_row-2">
              <input {...createEvent.fields.shared.as("radio", "public")} /> Public
            </label>
            <label class="_row-2">
              <input {...createEvent.fields.shared.as("radio", "private")} /> Private
            </label>
          </span>
          <label class="_row-2">
            <input {...createEvent.fields.shared.as("radio", "shared")} />
            Only with specific people
          </label>
          <Select
            {...createEvent.fields.shared_with.as("select multiple")}
            onchange={() => {
              createEvent.fields.shared.set("shared");
            }}
            style="width: 100%"
          >
            {#each followings as { following } (following.id)}
              <option value={following.id}>{following.displayName}</option>
            {/each}
          </Select>
        </span>
      </p>
      <p class="label">
        <span>Tags</span>
        <span class="_row-2" style="flex: 1">
          {#each tags as tag (tag.id)}
            <label class="tag" style:--color="#{tag.color}">
              <input
                {...createEvent.fields.tags.as("checkbox", String(tag.id))}
              />
              {tag.name}
            </label>
          {/each}
        </span>
      </p>
      <p style="display: flex; gap: .5em; justify-content: end">
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
    max-width: 100%;
    padding: 0;
    margin: 0;
    background: none;
    border: 0;
    border-radius: 0.25em;
    box-shadow: 0 0 1em var(--ui-neutral-9);
  }

  .label {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    > :first-child {
      min-width: 5em;
      font-weight: bold;
      text-align: right;
      user-select: none;
    }
  }

  .tag {
    padding: 0.5em;
    contain: paint;
    color: #000;
    text-shadow: 0 0 0.5rem #fff;
    cursor: pointer;
    border: 2px solid var(--color);
    border-radius: 0.25em;
    border-radius: 0.5;

    input {
      position: absolute;
      opacity: 0;
    }

    &:has(:checked) {
      background-color: var(--color);
    }

    &:has(:focus-visible) {
      outline: 2px solid var(--ui-border-hover);
      outline-offset: 2px;
    }
  }
</style>
