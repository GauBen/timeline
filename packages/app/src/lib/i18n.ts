import { page } from "$app/stores";
import { derived } from "svelte/store";

export * as m from "$paraglide/messages.js";
export {
  isAvailableLanguageTag,
  languageTag,
  setLanguageTag,
} from "$paraglide/runtime.js";

export const language = derived(page, ($page) => $page.data.language);
