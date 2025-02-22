-- AlterTable
ALTER TABLE "google_calendar_syncs" ADD COLUMN     "last_synced_at" TIMESTAMPTZ(6),
ADD COLUMN     "pull_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "push_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sync_errors" JSONB NOT NULL DEFAULT 'null',
ADD COLUMN     "sync_token" VARCHAR(128),
ADD COLUMN     "synced_events" INTEGER NOT NULL DEFAULT 0;
