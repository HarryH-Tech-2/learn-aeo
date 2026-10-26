-- AlterTable: Subscription gains a plan, the Stripe subscription id and the period end
ALTER TABLE "Subscription" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'lifetime';
ALTER TABLE "Subscription" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "currentPeriodEnd" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- AlterTable: User can belong to one licence
ALTER TABLE "User" ADD COLUMN "licenceId" TEXT;

-- CreateTable
CREATE TABLE "Licence" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "schoolName" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Licence_code_key" ON "Licence"("code");
CREATE UNIQUE INDEX "Licence_stripeSubscriptionId_key" ON "Licence"("stripeSubscriptionId");
CREATE INDEX "Licence_ownerUserId_idx" ON "Licence"("ownerUserId");

-- AddForeignKey
ALTER TABLE "Licence" ADD CONSTRAINT "Licence_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_licenceId_fkey" FOREIGN KEY ("licenceId") REFERENCES "Licence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
