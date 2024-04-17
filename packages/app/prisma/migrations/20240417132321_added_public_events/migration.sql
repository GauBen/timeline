-- AlterTable
ALTER TABLE "events" ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "events_author_id_idx" ON "events"("author_id");
