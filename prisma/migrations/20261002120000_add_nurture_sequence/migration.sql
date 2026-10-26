-- AlterTable: User gains a creation timestamp and the nurture-sequence fields
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "nurtureStartedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "emailUnsubscribedAt" TIMESTAMP(3);

-- Backfill createdAt for existing rows from the cuid id, whose characters 2-9
-- are the creation time in milliseconds, base36. New rows use the default.
CREATE OR REPLACE FUNCTION pg_temp.cuid_created_ms(id TEXT) RETURNS BIGINT AS $$
DECLARE
  s TEXT := substring(id from 2 for 8);
  n BIGINT := 0;
  i INT;
BEGIN
  IF id IS NULL OR left(id, 1) <> 'c' OR s !~ '^[0-9a-z]{8}$' THEN
    RETURN NULL;
  END IF;
  FOR i IN 1..8 LOOP
    n := n * 36 + position(substr(s, i, 1) IN '0123456789abcdefghijklmnopqrstuvwxyz') - 1;
  END LOOP;
  RETURN n;
END
$$ LANGUAGE plpgsql;

UPDATE "User"
SET "createdAt" = to_timestamp(pg_temp.cuid_created_ms(id) / 1000.0)
WHERE pg_temp.cuid_created_ms(id) IS NOT NULL;

-- CreateTable
CREATE TABLE "EmailSend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailSend_userId_key_key" ON "EmailSend"("userId", "key");

-- AddForeignKey
ALTER TABLE "EmailSend" ADD CONSTRAINT "EmailSend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
