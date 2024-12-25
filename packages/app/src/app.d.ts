import type { AvailableLanguageTag } from "messages/runtime";
import type Supabase from "@supabase/supabase-js";
import type Prisma from "@prisma/client";
import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface Locals {
      session?: User;
      language: AvailableLanguageTag;
    }
    interface PageData {
      session?: Supabase.User;
      me?: Prisma.User;
      language: AvailableLanguageTag;
      timezones: string[];
    }
    // interface Error {}
    // interface Platform {}
  }
}
