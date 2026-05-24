-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "partId" TEXT;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "prelimBadgeEn" TEXT,
ADD COLUMN     "prelimBadgeFr" TEXT,
ADD COLUMN     "prelimDescEn" TEXT,
ADD COLUMN     "prelimDescFr" TEXT,
ADD COLUMN     "prelimEmbedUrl" TEXT,
ADD COLUMN     "prelimTitleEn" TEXT,
ADD COLUMN     "prelimTitleFr" TEXT,
ADD COLUMN     "prelimUrl" TEXT;

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT,
    "subtitleFr" TEXT,
    "subtitleEn" TEXT,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Part_quizId_order_idx" ON "Part"("quizId", "order");

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
