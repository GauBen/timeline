-- CreateTable
CREATE TABLE "google_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT
);

-- CreateTable
CREATE TABLE "sessions" (
    "google_user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL PRIMARY KEY,
    "expires_at" DATETIME NOT NULL,
    CONSTRAINT "sessions_google_user_id_fkey" FOREIGN KEY ("google_user_id") REFERENCES "google_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "google_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "follows" (
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follower_id" INTEGER NOT NULL,
    "following_id" INTEGER NOT NULL,

    PRIMARY KEY ("follower_id", "following_id"),
    CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start" DATETIME NOT NULL,
    "start_timezone" TEXT,
    "end" DATETIME NOT NULL,
    "end_timezone" TEXT,
    "body" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "author_id" INTEGER NOT NULL,
    CONSTRAINT "events_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "owner_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "tags_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events_to_users" (
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "added" BOOLEAN,

    PRIMARY KEY ("event_id", "user_id"),
    CONSTRAINT "events_to_users_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "events_to_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "habits" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "habit_marks" (
    "habit_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,

    PRIMARY KEY ("habit_id", "date"),
    CONSTRAINT "habit_marks_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "author_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "body" TEXT NOT NULL,

    PRIMARY KEY ("author_id", "date"),
    CONSTRAINT "journal_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "journal_tags" (
    "author_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "tag" TEXT NOT NULL,

    PRIMARY KEY ("author_id", "tag", "date"),
    CONSTRAINT "journal_tags_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "journal_tags_author_id_date_fkey" FOREIGN KEY ("author_id", "date") REFERENCES "journal_entries" ("author_id", "date") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "google_calendar_syncs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "calendar_id" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "last_synced_at" DATETIME,
    "sync_token" TEXT,
    "pull_count" INTEGER NOT NULL DEFAULT 0,
    "push_count" INTEGER NOT NULL DEFAULT 0,
    "synced_events" INTEGER NOT NULL DEFAULT 0,
    "sync_errors" JSONB NOT NULL DEFAULT null,
    CONSTRAINT "google_calendar_syncs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "google_calendar_syncs_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EventToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EventToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_viewers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_viewers_A_fkey" FOREIGN KEY ("A") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_viewers_B_fkey" FOREIGN KEY ("B") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "google_users_email_key" ON "google_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

-- CreateIndex
CREATE INDEX "events_author_id_idx" ON "events"("author_id");

-- CreateIndex
CREATE INDEX "events_start_idx" ON "events"("start");

-- CreateIndex
CREATE INDEX "events_end_idx" ON "events"("end");

-- CreateIndex
CREATE INDEX "events_to_users_user_id_idx" ON "events_to_users"("user_id");

-- CreateIndex
CREATE INDEX "google_calendar_syncs_tag_id_idx" ON "google_calendar_syncs"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_calendar_syncs_user_id_calendar_id_key" ON "google_calendar_syncs"("user_id", "calendar_id");

-- CreateIndex
CREATE UNIQUE INDEX "_EventToTag_AB_unique" ON "_EventToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToTag_B_index" ON "_EventToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_viewers_AB_unique" ON "_viewers"("A", "B");

-- CreateIndex
CREATE INDEX "_viewers_B_index" ON "_viewers"("B");

CREATE VIEW "timeline" AS SELECT
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
  );
