<script lang="ts">
  import Button from "$lib/Button.svelte";
  import Card from "$lib/Card.svelte";
  import { colors, variants } from "$lib/definitions.js";
  import "uistiti/css";

  const keys = Object.keys as <T>(o: T) => Array<keyof T>;
</script>

<section>
  <h2>All combinations</h2>
  <table>
    <tbody>
      {#each keys(variants) as variant (variant)}
        <tr>
          {#each keys(colors) as color (color)}
            <td>
              <Button {variant} {color}>
                {variant}
                {color}
              </Button>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<section class="_stack-2">
  <h2>Inheritance</h2>
  {#each keys(colors) as color (color)}
    <Card {color} class="_stack-4">
      <h3 style="text-transform: capitalize">{color}</h3>
      <p>
        <Button>Ok</Button>
      </p>
    </Card>
  {/each}
</section>

<style lang="scss">
  section {
    max-width: 80rem;
    padding-inline: 1rem;
    margin: 1rem auto;
  }
</style>
