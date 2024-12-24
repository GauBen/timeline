<script lang="ts">
  import Button from "$lib/Button.svelte";
  import Card from "$lib/Card.svelte";
  import { colors, variants } from "$lib/definitions.js";
  import "modern-normalize/modern-normalize.css";
  import "uistiti/global.css";
  import "uistiti/reset.css";
  import "uistiti/utils.css";

  const keys = Object.keys as <T>(o: T) => Array<keyof T>;
</script>

<section>
  <h2>All combinations</h2>
  <table>
    <tbody>
      {#each keys(variants) as variant}
        <tr>
          {#each keys(colors) as color}
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

<section>
  <h2>Inheritance</h2>
  {#each keys(colors) as color}
    <Card {color}>
      <h3 style="margin-top: 0; text-transform: capitalize">{color}</h3>
      <Button>Ok</Button>
    </Card>
  {/each}
</section>

<style lang="scss">
  section {
    max-width: 80rem;
    margin: 1rem auto;
    padding-inline: 1rem;
  }
</style>
