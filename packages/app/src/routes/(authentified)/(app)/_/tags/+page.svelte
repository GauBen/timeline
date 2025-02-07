<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button, Card, Input } from "uistiti";

  const { data } = $props();
</script>

<ul>
  {#each data.tags as tag}
    <li style:background-color="#{tag.color}">{tag.name}</li>
  {/each}
</ul>

<form method="POST" use:enhance>
  <Card class="_stack-4">
    {#snippet header()}
      New tag
    {/snippet}
    <p>
      <label class="label">
        <span>Tag name</span>
        <Input
          type="text"
          name="name"
          required
          maxlength={64}
          style="flex: 1"
        />
      </label>
    </p>
    <p>
      <label class="label">
        <span>Tag color</span>
        <Input type="color" name="color" value="#1199AA" />
      </label>
    </p>
    <p>
      <Button type="submit" color="success">New tag</Button>
    </p>
  </Card>
</form>

<style lang="scss">
  ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1em;

    li {
      padding: 0.5em;
      border-radius: 0.25em;
      text-shadow: 0 0 0.5rem #fff;
    }
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
</style>
