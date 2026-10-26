-- AlterTable
ALTER TABLE "User" ADD COLUMN "signupSource" TEXT,
ADD COLUMN "signupCampaign" TEXT;

-- CreateTable
CREATE TABLE "CampaignVisit" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignVisit_visitorId_source_campaign_key" ON "CampaignVisit"("visitorId", "source", "campaign");

-- CreateIndex
CREATE INDEX "CampaignVisit_source_campaign_idx" ON "CampaignVisit"("source", "campaign");
