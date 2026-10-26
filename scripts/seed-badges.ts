import { PrismaClient } from "@prisma/client";
import { BADGE_DEFINITIONS } from "../src/lib/gamification";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding badges...");

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

  console.log(`\nSeeded ${BADGE_DEFINITIONS.length} badges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
