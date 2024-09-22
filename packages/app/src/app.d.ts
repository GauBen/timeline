import type { AvailableLanguageTag } from "$paraglide/runtime.js";
import type { User } from "@supabase/supabase-js";
import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface Locals {
      session?: User;
      language: AvailableLanguageTag;
    }
    interface PageData {
      session?: User;
      language: AvailableLanguageTag;
      timezones: string[];
    }
    // interface Error {}
    // interface Platform {}
  }
}
