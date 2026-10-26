-- CreateTable
CREATE TABLE "SignReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "glyph" TEXT NOT NULL,
    "ease" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval" INTEGER NOT NULL DEFAULT 2,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "lastReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignReview_userId_glyph_key" ON "SignReview"("userId", "glyph");

-- CreateIndex
CREATE INDEX "SignReview_userId_due_idx" ON "SignReview"("userId", "due");

-- AddForeignKey
ALTER TABLE "SignReview" ADD CONSTRAINT "SignReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
