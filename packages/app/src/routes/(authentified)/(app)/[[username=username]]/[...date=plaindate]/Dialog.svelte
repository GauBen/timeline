<script lang="ts">
  import { enhance } from "$app/forms";
  import TimezonePicker from "$lib/components/TimezonePicker.svelte";
  import { Temporal } from "@js-temporal/polyfill";
  import type { Follow, User } from "@prisma/client";
  import { untrack } from "svelte";
  import { Button } from "uistiti";

  let {
    timezone,
    followings,
    toggleEventCreation,
    getEventInCreationElement,
    eventInCreation,
  }: {
    timezone: string;
    followings: Array<Follow & { following: User }>;
    toggleEventCreation: (
      datetime?: Temporal.PlainDateTime | undefined,
    ) => Promise<void>;
    getEventInCreationElement?: () => HTMLElement;
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

<dialog open style:transform="translate({x}px, {y}px)" bind:this={dialog}>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <h2
    onmousedown={() => {
      mousedown = true;
    }}
  >
    Create a new event
  </h2>
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <form
    onreset={async () => toggleEventCreation()}
    use:enhance
    method="POST"
    action="?/createEvent"
    onkeydown={(event) => {
      event.stopPropagation();
      if (event.key === "Escape") event.currentTarget.reset();
    }}
  >
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
    <p>
      Timezone:
      <TimezonePicker bind:timezone />
    </p>
    <p>
      Visibility:
      <label>
        <input type="radio" name="public" value="on" bind:group={pub} /> Public
      </label>
      <label>
        <input type="radio" name="public" value="" bind:group={pub} /> Only with
        specific people
      </label>
      <select multiple disabled={Boolean(pub)} name="shared_with">
        {#each followings as { following }}
          <option value={following.id}>{following.displayName}</option>
        {/each}
      </select>
    </p>
    <p>
      <Button type="submit" color="success">Create</Button>
      <Button type="reset" color="danger" variant="outline">Cancel</Button>
    </p>
  </form>
</dialog>

<style lang="scss">
  dialog {
    z-index: 100;
    padding: 0;
  }

  form {
    padding-inline: 1rem;
  }

  h2 {
    margin: 0;
    background: #ccc;
    padding: 0.5rem;
    cursor: move;
    user-select: none;
  }
</style>
