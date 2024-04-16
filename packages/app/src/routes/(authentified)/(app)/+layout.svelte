<script lang="ts">
  const { children, data } = $props();
</script>

<div class="layout">
  <header>
    <h1>Timeline</h1>
    <div>
      <select
        value={data.language}
        on:change={function () {
          document.cookie = `language=${this.value}; path=/; max-age=31536000`;
          location.reload();
        }}
      >
        <option value="en-US">English</option>
        <option value="fr-FR">Français</option>
      </select>
      <a href="/auth/logout" rel="external">Logout</a>
    </div>
  </header>

  {@render children()}
</div>

<style lang="scss">
  header {
    display: grid;
    grid-template-columns: 1fr auto;
    padding: 0.5rem;
    background: #fff;
    align-items: center;

    > * {
      margin: 0;
    }
  }

  .layout {
    height: 100vh;
    display: grid;
    grid-template-rows: auto 1fr;
    background: #19191a10;
    gap: 1px;
  }
</style>
