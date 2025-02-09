/*
  Warnings:

  - You are about to drop the column `tokens` on the `google_users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "google_users" DROP COLUMN "tokens",
ADD COLUMN     "access_token" VARCHAR(2048),
ADD COLUMN     "refresh_token" VARCHAR(512);
