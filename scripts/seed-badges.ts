import { PrismaClient } from "@prisma/client";
import { BADGE_DEFINITIONS, badgeCriteriaKeys } from "../src/lib/gamification";
import { staleBadgeNames } from "../src/lib/badge-seed";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding badges...");

  // Rename in place first: a badge whose criteria is still defined (or maps to a current one) keeps its row,
  // so the badges people have already earned survive a rename.
  for (const badge of BADGE_DEFINITIONS) {
    const row = await prisma.badge.findFirst({ where: { criteria: { in: badgeCriteriaKeys(badge.criteria) } } });
    if (row && row.name !== badge.name && !(await prisma.badge.findUnique({ where: { name: badge.name } }))) {
      await prisma.badge.update({ where: { id: row.id }, data: { name: badge.name, criteria: badge.criteria } });
      console.log(`  → renamed ${row.name} to ${badge.name}`);
    }
  }

  // Remove badges that are no longer defined (their user badges cascade), so an old row
  // sharing a criteria key (e.g. streak:3) can never shadow the new one in the badges check.
  const existing = await prisma.badge.findMany({ select: { id: true, name: true } });
  const stale = staleBadgeNames(existing.map((b) => b.name), BADGE_DEFINITIONS);
  if (stale.length > 0) {
    await prisma.badge.deleteMany({ where: { name: { in: stale } } });
    for (const name of stale) console.log(`  ✗ removed ${name}`);
  }

  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {
        description: badge.description,
        icon: badge.icon,
        criteria: badge.criteria,
      },
      create: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        criteria: badge.criteria,
      },
    });
    console.log(`  ✓ ${badge.name}`);
  }

  console.log(`\nSeeded ${BADGE_DEFINITIONS.length} badges, removed ${stale.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
