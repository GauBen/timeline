<script lang="ts">
  import { enhance } from "$app/forms";
  import { Temporal } from "@js-temporal/polyfill";
  import { Button } from "uistiti";

  let {
    onreset,
    eventInCreation = $bindable(),
  }: {
    onreset: () => void;
    eventInCreation: Temporal.PlainDateTime;
  } = $props();

  let mousedown = $state(false);
  let x = $state(0);
  let y = $state(0);
  let dialog = $state<HTMLDialogElement>();
</script>

<svelte:document
  onmouseup={() => {
    mousedown = false;
  }}
  onmousemove={({ movementX, movementY }) => {
    if (mousedown && dialog) {
      const { top, left, bottom, right } = dialog.getBoundingClientRect();

      // Move the dialog within the screen
      if (left + movementX < 0) x -= left;
      else if (right + movementX > window.innerWidth)
        x -= right - window.innerWidth;
      else x += movementX;

      if (top + movementY < 0) y -= top;
      else if (bottom + movementY > window.innerHeight)
        y -= bottom - window.innerHeight;
      else y += movementY;
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
    {onreset}
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
