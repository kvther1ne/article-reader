-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyPoints" TEXT[],
    "tags" TEXT[],
    "readingTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);
