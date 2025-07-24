<script lang="ts">
  import i18n from "$lib/i18n.svelte.js";
  import * as m from "messages";
  import { Select } from "uistiti";
</script>

<p>
  <label class="_row-2">
    <span class="i-ph-translate-duotone"></span>
    {m.cuddly_weird_reindeer_express()}
    <Select
      value={i18n.locale}
      onchange={({ currentTarget }) => {
        document.cookie = `locale=${currentTarget.value}; path=/; max-age=31536000`;
        location.reload();
      }}
    >
      <option value="en-US">English</option>
      <option value="fr-FR">Français</option>
    </Select>
  </label>
</p>

<p>
  <a href="/auth/logout" rel="external">Logout</a>
</p>
