-- AlterTable: add cross-cutting tags + draft-preview token to lessons
ALTER TABLE "lessons" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "lessons" ADD COLUMN "previewToken" TEXT;

-- CreateIndex: enforce one lesson per preview token
CREATE UNIQUE INDEX "lessons_previewToken_key" ON "lessons"("previewToken");

-- CreateIndex: GIN index for efficient tag containment queries (has/hasSome)
CREATE INDEX "lessons_tags_idx" ON "lessons" USING GIN ("tags");
