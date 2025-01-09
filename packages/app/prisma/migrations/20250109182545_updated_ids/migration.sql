DROP VIEW "timeline";

ALTER TABLE "events" ADD COLUMN "new_author_id" BIGINT;
UPDATE "events" SET "new_author_id" = "google_id" FROM "users" WHERE "events"."author_id" = "users"."id";
ALTER TABLE "events" ALTER COLUMN "new_author_id" SET NOT NULL;
ALTER TABLE "events" DROP CONSTRAINT "events_author_id_fkey";
ALTER TABLE "events" DROP COLUMN "author_id";
ALTER TABLE "events" RENAME COLUMN "new_author_id" TO "author_id";
CREATE INDEX "events_author_id_idx" ON "events"("author_id");

ALTER TABLE "events_to_users" ADD COLUMN "new_user_id" BIGINT;
UPDATE "events_to_users" SET "new_user_id" = "google_id" FROM "users" WHERE "events_to_users"."user_id" = "users"."id";
ALTER TABLE "events_to_users" ALTER COLUMN "new_user_id" SET NOT NULL;
ALTER TABLE "events_to_users" DROP CONSTRAINT "events_to_users_user_id_fkey";
ALTER TABLE "events_to_users" DROP COLUMN "user_id";
ALTER TABLE "events_to_users" RENAME COLUMN "new_user_id" TO "user_id";
ALTER TABLE "events_to_users" ADD CONSTRAINT "events_to_users_pkey" PRIMARY KEY ("event_id", "user_id");
CREATE INDEX "events_to_users_user_id_idx" ON "events_to_users"("user_id");

ALTER TABLE "follows" ADD COLUMN "new_follower_id" BIGINT;
UPDATE "follows" SET "new_follower_id" = "google_id" FROM "users" WHERE "follows"."follower_id" = "users"."id";
ALTER TABLE "follows" ALTER COLUMN "new_follower_id" SET NOT NULL;
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_fkey";
ALTER TABLE "follows" DROP COLUMN "follower_id";
ALTER TABLE "follows" RENAME COLUMN "new_follower_id" TO "follower_id";

ALTER TABLE "follows" ADD COLUMN "new_following_id" BIGINT;
UPDATE "follows" SET "new_following_id" = "google_id" FROM "users" WHERE "follows"."following_id" = "users"."id";
ALTER TABLE "follows" ALTER COLUMN "new_following_id" SET NOT NULL;
ALTER TABLE "follows" DROP CONSTRAINT "follows_following_id_fkey";
ALTER TABLE "follows" DROP COLUMN "following_id";
ALTER TABLE "follows" RENAME COLUMN "new_following_id" TO "following_id";

ALTER TABLE "follows" ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id", "following_id");
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

ALTER TABLE "habits" ADD COLUMN "new_user_id" BIGINT;
UPDATE "habits" SET "new_user_id" = "google_id" FROM "users" WHERE "habits"."user_id" = "users"."id";
ALTER TABLE "habits" ALTER COLUMN "new_user_id" SET NOT NULL;
ALTER TABLE "habits" DROP CONSTRAINT "habits_user_id_fkey";
ALTER TABLE "habits" DROP COLUMN "user_id";
ALTER TABLE "habits" RENAME COLUMN "new_user_id" TO "user_id";

ALTER TABLE "journal_entries" ADD COLUMN "new_author_id" BIGINT;
UPDATE "journal_entries" SET "new_author_id" = "google_id" FROM "users" WHERE "journal_entries"."author_id" = "users"."id";
ALTER TABLE "journal_entries" ALTER COLUMN "new_author_id" SET NOT NULL;
ALTER TABLE "journal_entries" DROP COLUMN "author_id" CASCADE;
ALTER TABLE "journal_entries" RENAME COLUMN "new_author_id" TO "author_id";

ALTER TABLE "journal_tags" ADD COLUMN "new_author_id" BIGINT;
UPDATE "journal_tags" SET "new_author_id" = "google_id" FROM "users" WHERE "journal_tags"."author_id" = "users"."id";
ALTER TABLE "journal_tags" ALTER COLUMN "new_author_id" SET NOT NULL;
ALTER TABLE "journal_tags" DROP COLUMN "author_id" CASCADE;
ALTER TABLE "journal_tags" RENAME COLUMN "new_author_id" TO "author_id";

ALTER TABLE "users" DROP COLUMN "id", DROP COLUMN "email";
ALTER TABLE "users" RENAME COLUMN "google_id" TO "id";
DROP INDEX "users_google_id_key";
ALTER TABLE "users" RENAME CONSTRAINT "users_google_id_fkey" TO "users_id_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE "events" ADD CONSTRAINT "events_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events_to_users" ADD CONSTRAINT "events_to_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "journal_tags" ADD CONSTRAINT "journal_tags_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("author_id", "date");
ALTER TABLE "journal_tags" ADD CONSTRAINT "journal_tags_pkey" PRIMARY KEY ("author_id", "tag", "date");
ALTER TABLE "journal_tags" ADD CONSTRAINT "journal_tags_author_id_date_fkey" FOREIGN KEY ("author_id", "date") REFERENCES "journal_entries"("author_id", "date") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE VIEW timeline
WITH (security_invoker = true)
AS SELECT
  users.id AS user_id,
  events.id,
  events.created_at,
  events.date,
  events.duration,
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
  OR EXISTS (
    SELECT
      1
    FROM
      events_to_users
    WHERE
      event_id = events.id
      AND user_id = users.id
      AND shared
  );
