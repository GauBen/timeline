import { D1Database } from "@cloudflare/workers-types";
import type { GoogleUser, PrismaClient, User } from "db";
import type { Locale } from "messages/runtime";
import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface Locals {
      session?: GoogleUser;
      locale: Locale;
      prisma: PrismaClient;
    }
    interface PageData {
      session?: GoogleUser;
      me?: User;
      locale: Locale;
      timezones: string[];
    }
    // interface Error {}
    interface Platform {
      env: {
        DB: D1Database;
      };
    }
  }
}
