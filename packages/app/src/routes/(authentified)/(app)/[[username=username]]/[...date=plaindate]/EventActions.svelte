<script lang="ts">
  import type { Event } from "$lib/types.js";
  import type { User } from "$prisma";
  import { Button } from "uistiti";

  export const { event, me }: { event: Event; me: User } = $props();
</script>

{#if event.author.id === me.id}
  <Button color="danger" formaction="?/deleteEvent={event.id}">Delete</Button>
{:else if event.added}
  <Button color="neutral" formaction="?/unAddEvent={event.id}">Un-add</Button>
{:else}
  <Button color="success" formaction="?/addEvent={event.id}">Add</Button>
{/if}
