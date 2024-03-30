import type { User } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      session?: User;
    }
    interface PageData {
      me?: User;
    }
    // interface Error {}
    // interface Platform {}
  }
}
