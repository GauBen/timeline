<script lang="ts">
  import { language } from "$lib/i18n";
</script>

<div>
  <select
    value={$language}
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
