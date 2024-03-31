<script lang="ts">
  import { toTemporalInstant, Temporal } from "@js-temporal/polyfill";
  const { data } = $props();

  const start = $derived(Temporal.ZonedDateTime.from(data.date));

  const fixDate = (date: Date) =>
    toTemporalInstant.call(date).toZonedDateTime({
      calendar: "iso8601",
      timeZone: "Europe/Paris",
    });

  const toPixels = (date: Temporal.ZonedDateTime) =>
    // We can't just use `date.since` because of DST!
    date.toPlainTime().since(start.toPlainTime()).total({ unit: "hours" }) *
    100;
</script>

<section>
  {#each Array.from({ length: 23 }, (_, i) => i + 1) as hour}
    <div style:top="{hour * 100}px">
      <span
        >{Temporal.PlainTime.from({ hour }).toLocaleString("fr-FR", {
          hour: "numeric",
          minute: "numeric",
        })}</span
      >
    </div>
  {/each}
  {#each data.events as { author, body, date }}
    <article style:top="{toPixels(fixDate(date))}px">
      @{author.username}<br />
      {body}<br />
      {fixDate(date).toLocaleString("fr-FR", {
        hour: "numeric",
        minute: "numeric",
      })}
    </article>
  {/each}
</section>

<style lang="scss">
  section {
    contain: content;
    background: #f0f0f0;
    min-height: 2400px;
  }

  article {
    position: absolute;
    background: skyblue;
    padding: 0.5em;
    border-radius: 0.5em;
    left: 2.5em;
  }

  div {
    position: absolute;
    width: 100%;
    margin: 0;
    border: 0;
    border-top: 1px solid #ccc;
    line-height: 0;
    color: #888;
    user-select: none;

    span {
      background: #f0f0f0;
      font-size: 0.8em;
      padding: 0.25em;
    }
  }
</style>
