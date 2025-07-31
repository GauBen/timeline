<script lang="ts">
  import { Card } from "uistiti";
  import type { HTMLDialogAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  const {
    children,
    header,
    ...props
  }: HTMLDialogAttributes & { header: Snippet } = $props();

  let mousedown = $state(false);
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
</script>

<svelte:document
  onmouseup={() => (mousedown = false)}
  onmousemove={(event) => {
    if (mousedown && dialog) {
      moveDialog(event, dialog.getBoundingClientRect());
    }
  }}
/>

<dialog {...props} style:transform="translate({x}px, {y}px)" bind:this={dialog}>
  <Card
    {header}
    headerProps={{
      style: "cursor: move; user-select: none",
      onmousedown: () => (mousedown = true),
    }}
  >
    {@render children?.()}
  </Card>
</dialog>

<style lang="scss">
  dialog {
    z-index: 100;
    min-width: 20rem;
    max-width: 100%;
    padding: 0;
    margin: 0 auto;
    background: none;
    border: 0;
    border-radius: 0.25em;
    box-shadow: 0 0 1em var(--ui-neutral-9);
  }
</style>
