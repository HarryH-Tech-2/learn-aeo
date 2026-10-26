// Read-only diagnostic: where in the signup -> payment funnel are people dropping off?
// Run with: node --env-file=.env scripts/diagnose-funnel.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function pct(n, total) {
  if (!total) return "0%";
  return `${((n / total) * 100).toFixed(1)}%`;
}

async function main() {
  const [
    totalUsers,
    pendingUsers,
    activeUsers,
    verifiedUsers,
    usersWithAnyProgress,
    usersWithCompletedLesson,
    totalSubRows,
    subsWithStripeCustomer,
    activeSubs,
    trialSubs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { lessonProgress: { some: {} } } }),
    prisma.user.count({ where: { lessonProgress: { some: { completed: true } } } }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { stripeCustomerId: { not: null } } }),
    prisma.subscription.count({ where: { active: true } }),
    prisma.subscription.count({ where: { trial: true } }),
  ]);

  // Signup recency buckets
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const [last7, last30, last90] = await Promise.all([
    prisma.user.count({ where: { /* createdAt missing -> use sessions/accounts? */ } }),
    // User model has no createdAt; use Subscription.createdAt as a proxy where present
    prisma.subscription.count({ where: { createdAt: { gte: new Date(now - 30 * day) } } }),
    prisma.subscription.count({ where: { createdAt: { gte: new Date(now - 90 * day) } } }),
  ]);

  console.log("=== USER FUNNEL ===");
  console.log(`Total users:               ${totalUsers}`);
  console.log(`  - PENDING:               ${pendingUsers} (${pct(pendingUsers, totalUsers)})`);
  console.log(`  - ACTIVE:                ${activeUsers} (${pct(activeUsers, totalUsers)})`);
  console.log(`  - emailVerified:         ${verifiedUsers} (${pct(verifiedUsers, totalUsers)})`);
  console.log("");
  console.log("=== LESSON ENGAGEMENT ===");
  console.log(`Users w/ any progress:     ${usersWithAnyProgress} (${pct(usersWithAnyProgress, totalUsers)})`);
  console.log(`Users w/ completed lesson: ${usersWithCompletedLesson} (${pct(usersWithCompletedLesson, totalUsers)})`);
  console.log("");
  console.log("=== STRIPE / SUBSCRIPTION ===");
  console.log(`Subscription rows total:   ${totalSubRows} (${pct(totalSubRows, totalUsers)} of users)`);
  console.log(`  - w/ stripeCustomerId:   ${subsWithStripeCustomer} (reached Stripe)`);
  console.log(`  - active = true:         ${activeSubs}`);
  console.log(`  - trial = true:          ${trialSubs}`);
  console.log("");
  console.log("=== RECENT SUBSCRIPTION ROWS (Subscription.createdAt) ===");
  console.log(`Last 30 days: ${last30}`);
  console.log(`Last 90 days: ${last90}`);

  // Sample the most recent 10 users so we can see who they are
  const recent = await prisma.user.findMany({
    orderBy: { id: "desc" },
    take: 15,
    select: {
      id: true,
      email: true,
      status: true,
      emailVerified: true,
      subscription: {
        select: { stripeCustomerId: true, active: true, trial: true, createdAt: true },
      },
      _count: { select: { lessonProgress: true } },
    },
  });
  console.log("");
  console.log("=== MOST RECENT 15 USERS ===");
  for (const u of recent) {
    const reachedStripe = u.subscription?.stripeCustomerId ? "yes" : "no";
    const paying = u.subscription?.active ? "ACTIVE" : u.subscription?.trial ? "trial" : "no";
    const verified = u.emailVerified ? "verified" : "unverified";
    console.log(
      `  ${u.email ?? "<no-email>"}  | status=${u.status} ${verified} | lessons=${u._count.lessonProgress} | stripe=${reachedStripe} | sub=${paying}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
