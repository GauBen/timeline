DROP INDEX "events_date_idx";
DROP VIEW "timeline";

ALTER TABLE "events" RENAME COLUMN "date" TO "start";
ALTER TABLE "events" DROP COLUMN "duration",
ADD COLUMN "end" TIMESTAMPTZ(6),
ADD COLUMN "end_timezone" VARCHAR(32),
ALTER COLUMN "start_timezone" DROP NOT NULL;

UPDATE "events" SET "end" = "start" WHERE "end" IS NULL;
UPDATE "events" SET "end_timezone" = "start_timezone" WHERE "end_timezone" IS NULL;

ALTER TABLE "events" ALTER COLUMN "end" SET NOT NULL;

CREATE INDEX "events_start_idx" ON "events"("start");
CREATE INDEX "events_end_idx" ON "events"("end");

CREATE VIEW "timeline" AS
SELECT
  users.id AS user_id,
  events.id,
  events.created_at,
  events.start,
  events.start_timezone,
  events.end,
  events.end_timezone,
  events.body,
  events.public,
  events.author_id,
  author_id = users.id OR EXISTS (
    SELECT
      1
    FROM
      follows
    WHERE
      follower_id = users.id
      AND following_id = events.author_id
  ) AS followed,
  author_id = users.id OR (
    SELECT
      added
    FROM
      events_to_users
    WHERE
      event_id = events.id
      AND user_id = users.id
  ) AS added
FROM
  events
  CROSS JOIN users
WHERE
  events.public
  OR author_id = users.id
  OR EXISTS (
    SELECT
      1
    FROM
      events_to_users
    WHERE
      event_id = events.id
      AND user_id = users.id
      AND shared
  )
;
