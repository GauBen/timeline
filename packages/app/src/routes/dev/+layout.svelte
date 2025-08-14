<script>
  import { Card } from "uistiti";
</script>

<main
  style=" max-width: 60rem; padding: 1rem;margin-inline: auto"
  class="_stack-4"
>
  <Card color="warning" padding={2}>
    {#snippet header()}
      <span class="i-ph-wrench-duotone"></span> Timeline Developer Pages
    {/snippet}
    <p>
      This page is intended for development purposes and won't be made available
      on production deployments.
    </p>
  </Card>

  <slot />

  <footer style="text-align: center">
    <a href="https://github.com/GauBen/timeline">Timeline GitHub</a>
  </footer>
</main>
