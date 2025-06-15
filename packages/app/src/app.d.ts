import type { Locale } from "messages/runtime";
import type { GoogleUser, User } from "$prisma";
import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface Locals {
      session?: GoogleUser;
      locale: Locale;
    }
    interface PageData {
      session?: GoogleUser;
      me?: User;
      locale: Locale;
      timezones: string[];
    }
    // interface Error {}
    // interface Platform {}
  }
}
