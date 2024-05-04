-- AlterTable
ALTER TABLE "events_to_users" ALTER COLUMN "added" DROP NOT NULL,
ALTER COLUMN "added" DROP DEFAULT;
