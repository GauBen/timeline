-- CreateEnum
CREATE TYPE "SyncDirection" AS ENUM ('Both', 'Pull', 'Push');

-- CreateTable
CREATE TABLE "google_calendar_syncs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,
    "calendar_id" TEXT NOT NULL,
    "direction" "SyncDirection" NOT NULL,

    CONSTRAINT "google_calendar_syncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "google_calendar_syncs_tag_id_idx" ON "google_calendar_syncs"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_calendar_syncs_user_id_calendar_id_key" ON "google_calendar_syncs"("user_id", "calendar_id");

-- AddForeignKey
ALTER TABLE "google_calendar_syncs" ADD CONSTRAINT "google_calendar_syncs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_calendar_syncs" ADD CONSTRAINT "google_calendar_syncs_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
