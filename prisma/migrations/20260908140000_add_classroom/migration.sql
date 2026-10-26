-- CreateTable
CREATE TABLE "ClassRoom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'lobby',
    "questionIndex" INTEGER NOT NULL DEFAULT -1,
    "questionStartedAt" TIMESTAMP(3),
    "questionMs" INTEGER NOT NULL DEFAULT 20000,
    "quiz" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTeam" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassRoom_code_key" ON "ClassRoom"("code");

-- CreateIndex
CREATE INDEX "ClassRoom_expiresAt_idx" ON "ClassRoom"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClassTeam_roomId_name_key" ON "ClassTeam"("roomId", "name");

-- AddForeignKey
ALTER TABLE "ClassRoom" ADD CONSTRAINT "ClassRoom_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeam" ADD CONSTRAINT "ClassTeam_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ClassRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
