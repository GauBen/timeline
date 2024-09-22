ALTER TABLE "events" ADD COLUMN "start_timezone" VARCHAR(32) NOT NULL DEFAULT 'Europe/Paris';
ALTER TABLE "events" ALTER COLUMN "start_timezone" DROP DEFAULT;

ALTER TABLE "users" ADD COLUMN "timezone" VARCHAR(32) NOT NULL DEFAULT 'Europe/Paris';
ALTER TABLE "users" ALTER COLUMN "timezone" DROP DEFAULT;
