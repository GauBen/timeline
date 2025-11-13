<script lang="ts">
  const {
    number,
    weekday,
    selected,
  }: { number: string; weekday: string; selected: boolean } = $props();
</script>

<span class="block" aria-current={selected ? "date" : undefined}>
  <span class="weekday">{weekday}</span>
  <span class="number">{number}</span>
</span>

<style lang="scss">
  .block {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
  }

  .weekday {
    font-size: 0.75em;
    font-weight: 700;
    opacity: 0.5;
  }

  .number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(4em / 3);
    height: calc(4em / 3);
    font-family: Cookie, serif;
    font-size: 2em;
    font-weight: 400;
    border-radius: 99px;
  }

  .block[aria-current] .weekday {
    color: #f00;
  }

  .block[aria-current] .number {
    background: #fcc;
  }
</style>
