-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "embedding" vector(1536);
