import type { AvailableLocale } from "messages/runtime";
import type Prisma from "@prisma/client";
import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface Locals {
      session?: Prisma.GoogleUser;
      locale: AvailableLocale;
    }
    interface PageData {
      session?: Prisma.GoogleUser;
      me?: Prisma.User;
      locale: AvailableLocale;
      timezones: string[];
    }
    // interface Error {}
    // interface Platform {}
  }
}
