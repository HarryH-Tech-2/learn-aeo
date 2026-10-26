// Enrol existing free sign-ups in the nurture sequence by setting
// User.nurtureStartedAt = User.createdAt. Steps whose window has already
// passed are skipped by the cron (src/lib/nurture.ts), so a 20-day-old
// account gets nothing and a 2-day-old one picks up at day 3.
//
//   node --env-file=.env scripts/nurture-backfill.mjs            dry run, last 30 days
//   node --env-file=.env scripts/nurture-backfill.mjs --days 10  dry run, last 10 days
//   node --env-file=.env scripts/nurture-backfill.mjs --apply    write the enrolments

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const apply = args.includes("--apply");
const daysIdx = args.indexOf("--days");
const days = daysIdx >= 0 ? Number(args[daysIdx + 1]) : 30;
const since = new Date(Date.now() - days * 86_400_000);

const users = await prisma.user.findMany({
  where: { createdAt: { gte: since }, nurtureStartedAt: null, emailUnsubscribedAt: null, email: { not: null } },
  select: {
    id: true,
    email: true,
    createdAt: true,
    status: true,
    licenceId: true,
    subscription: { select: { active: true } },
    ownedLicences: { select: { id: true } },
  },
  orderBy: { createdAt: "asc" },
});

const eligible = users.filter(
  (u) => u.status !== "ACTIVE" && !u.subscription?.active && !u.licenceId && u.ownedLicences.length === 0
);

console.log(`${users.length} accounts created in the last ${days} days without an enrolment; ${eligible.length} have not bought.`);
for (const u of eligible) {
  const age = Math.floor((Date.now() - u.createdAt.getTime()) / 86_400_000);
  console.log(`  ${u.createdAt.toISOString().slice(0, 10)}  day ${String(age).padStart(2)}  ${u.email}`);
}

if (!apply) {
  console.log("\nDry run. Re-run with --apply to enrol them.");
} else {
  for (const u of eligible) {
    await prisma.user.update({ where: { id: u.id }, data: { nurtureStartedAt: u.createdAt } });
  }
  // They already had a welcome at sign-up (src/lib/signup-welcome.ts, live from
  // 2026-09-12 until the sequence replaced it), so mark day 0 as sent: the cron
  // would otherwise open with a second welcome for anyone 0–2 days old.
  await prisma.emailSend.createMany({
    data: eligible.map((u) => ({ userId: u.id, key: "welcome" })),
    skipDuplicates: true,
  });
  console.log(`\nEnrolled ${eligible.length} accounts.`);
}
await prisma.$disconnect();
