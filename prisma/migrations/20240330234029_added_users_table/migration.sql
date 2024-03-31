CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

ALTER TABLE "public"."users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
