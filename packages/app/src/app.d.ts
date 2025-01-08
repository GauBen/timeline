import type { AvailableLanguageTag } from "messages/runtime";
import type Prisma from "@prisma/client";
import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface Locals {
      session?: Prisma.GoogleUser;
      language: AvailableLanguageTag;
    }
    interface PageData {
      session?: Prisma.GoogleUser;
      me?: Prisma.User;
      language: AvailableLanguageTag;
      timezones: string[];
    }
    // interface Error {}
    // interface Platform {}
  }
}
