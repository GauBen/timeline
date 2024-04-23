ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- CreateTable
CREATE TABLE "follows" (
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follower_id" UUID NOT NULL,
    "following_id" UUID NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("follower_id","following_id")
);
ALTER TABLE "follows" ENABLE ROW LEVEL SECURITY;

-- CreateTable
CREATE TABLE "events" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "duration" INTEGER NOT NULL,
    "body" VARCHAR(1024) NOT NULL,
    "author_id" UUID NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
