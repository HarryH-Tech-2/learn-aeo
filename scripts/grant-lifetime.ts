import { PrismaClient } from "@prisma/client";

// Gives an existing account lifetime access without a purchase (User.status = ACTIVE, which
// checkSubscription in src/lib/subscription.ts reads as lifetime).
//   POSTGRES_URL=<pooled url> DATABASE_URL=<direct url> npx --yes tsx scripts/grant-lifetime.ts you@example.com
// The account must exist: sign in once first. A user row created here, with no linked Google account,
// would make that address's Google sign-in fail with OAuthAccountNotLinked.

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("Usage: tsx scripts/grant-lifetime.ts <email>");

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, status: true } });
  if (!user) throw new Error(`No account for ${email}. Sign in on the site once, then run this again.`);

  if (user.status === "ACTIVE") {
    console.log(`${email} already has lifetime access.`);
    return;
  }
  await prisma.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } });
  console.log(`✓ ${email} now has lifetime access.`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
