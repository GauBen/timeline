<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
</script>

<div>
  <select
    value={i18n.language}
    onchange={({ currentTarget }) => {
      document.cookie = `language=${currentTarget.value}; path=/; max-age=31536000`;
      location.reload();
    }}
  >
    <option value="en-US">English</option>
    <option value="fr-FR">Français</option>
  </select>
  <a href="/auth/logout" rel="external">Logout</a>
</div>
