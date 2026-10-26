-- Time-limited discount offer stored on the user (see src/lib/offers.ts)
ALTER TABLE "User" ADD COLUMN "offerCode" TEXT;
ALTER TABLE "User" ADD COLUMN "offerExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "offerSource" TEXT;
