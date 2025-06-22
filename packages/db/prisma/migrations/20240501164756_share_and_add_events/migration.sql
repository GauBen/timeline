-- CreateTable
CREATE TABLE "events_to_users" (
    "event_id" BIGINT NOT NULL,
    "user_id" UUID NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "added" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "events_to_users_pkey" PRIMARY KEY ("event_id","user_id")
);
ALTER TABLE "events_to_users" ENABLE ROW LEVEL SECURITY;

-- CreateIndex
CREATE INDEX "events_to_users_user_id_idx" ON "events_to_users"("user_id");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- AddForeignKey
ALTER TABLE "events_to_users" ADD CONSTRAINT "events_to_users_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_to_users" ADD CONSTRAINT "events_to_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
