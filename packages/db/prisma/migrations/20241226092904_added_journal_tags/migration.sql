-- CreateTable
CREATE TABLE "journal_tags" (
    "author_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "tag" VARCHAR(32) NOT NULL,

    CONSTRAINT "journal_tags_pkey" PRIMARY KEY ("author_id","tag","date")
);

ALTER TABLE "journal_tags" ENABLE ROW LEVEL SECURITY;
