-- CreateTable
CREATE TABLE "journal_entries" (
    "author_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("author_id","date")
);

ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;
