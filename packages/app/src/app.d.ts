import { D1Database, KVNamespace } from "@cloudflare/workers-types";
import type { Prisma, PrismaClient, User } from "db";
import type { Locale } from "messages/runtime";
import "temporal-polyfill/global";

declare global {
  namespace App {
    interface Locals {
      session?: Prisma.GoogleUserGetPayload<{
        select: { id: true; email: true; user: true };
      }>;
      locale: Locale;
      prisma: PrismaClient;
    }
    interface PageData {
      me?: User;
      locale: Locale;
      timezones: string[];
    }
    interface Platform {
      env: {
        DB: D1Database;
        SESSIONS: KVNamespace;
      };
    }
    interface PageState {
      start: Temporal.PlainDate;
    }
  }
}
