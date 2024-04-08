import type { AvailableLanguageTag } from "$paraglide/runtime.js";
import type { User } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      session?: User;
      language: AvailableLanguageTag;
    }
    interface PageData {
      session?: User;
      language: AvailableLanguageTag;
    }
    // interface Error {}
    // interface Platform {}
  }
}
